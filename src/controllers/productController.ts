// src/controllers/productController.ts
import { Request, Response } from "express";
import Product from "../models/Product";
import { createProductSchema } from "../validation/productValidation";


// ✅ إضافة منتج (Company ID من التوكن)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    

    const { error, value } = createProductSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map((d) => d.message) });
    }

    const {
      description,
      price,
      image,
      type,
      capacity,
      brand,
      installDuration,
      companyId: incomingCompanyId,
    } = value;

    // لو شركة → خده من التوكن فقط
    // لو أدمن → مش مفروض يوصل هنا أصلاً
    const companyId = user.role === "company" ? user.id : incomingCompanyId;

    const name = `${brand} ${capacity} حصان ${type}`;

    const product = await Product.create({
      name,
      description,
      price,
      company: companyId,
      image: image || "default.jpg",
      type,
      capacity,
      brand,
      installDuration,
    });

    return res.status(201).json({ message: "تم إنشاء المنتج", product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "حدث خطأ أثناء إنشاء المنتج", error: err });
  }
};



// ✅ جلب كل المنتجات مع فلترة وباجينيشن
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      keyword = "",
      minPrice,
      maxPrice,
      companyId,
      isSuspended,
      isHidden,
    } = req.query;

    const numericPage = Number(page);
    const numericLimit = Number(limit);

    const searchQuery = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    const filters: any = { ...searchQuery };

    if (minPrice) filters.price = { ...filters.price, $gte: Number(minPrice) };
    if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };
    if (companyId) filters.company = companyId;
    if (typeof isSuspended !== "undefined")
      filters.isSuspended = isSuspended === "true";
    if (typeof isHidden !== "undefined")
      filters.isHidden = isHidden === "true";

    const total = await Product.countDocuments(filters);

    const products = await Product.find(filters)
      .populate("company", "name email profileImage")
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);

    res.json({
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit),
      totalItems: total,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب المنتجات", error });
  }
};

// ✅ تحديث منتج
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "غير مصرح، يجب تسجيل الدخول" });
    }

    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    const { description, price, type, capacity, brand, installDuration } =
      updates;

    if (description) product.description = description;
    if (price) product.price = price;
    if (type) product.type = type;
    if (capacity) product.capacity = capacity;
    if (brand) product.brand = brand;
    if (installDuration) product.installDuration = installDuration;

    // إعادة تكوين الاسم تلقائيًا عند التعديل
    if (type && capacity && brand) {
      product.name = `${brand} ${capacity} حصان ${type}`;
    }

    // لو الأدمن هو اللي بيعدل، يقدر يغير خصائص إضافية
    if (user.role === "admin") {
      const { image, isSuspended, isHidden } = updates;
      if (image) product.image = image;
      if (typeof isSuspended === "boolean")
        product.isSuspended = isSuspended;
      if (typeof isHidden === "boolean") product.isHidden = isHidden;
    }

    await product.save();

    res.json({ message: "تم تحديث المنتج", product });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التحديث", error });
  }
};
// للعميل المفعلة فقط
export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isHidden: false }).populate("company", "name");
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب المنتجات" });
  }
};


//جلب كل المنتجات مع بيانات الشركة
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بالوصول" });
    }

    const {
      search,
      brand,
      power,
      minPrice,
      maxPrice,
      sortBy,
    } = req.query;

    const filters: any = {};

    if (brand) {
      filters.brand = brand;
    }

    if (power) {
      filters.power = power;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: any = {};
    if (sortBy === "sold") {
      sortOption = { sold: -1 };
    } else if (sortBy === "rating") {
      sortOption = { rating: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filters)
      .populate("company", "name email")
      .sort(sortOption);

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "خطأ في جلب المنتجات" });
  }
};


//تحديث حالة تعليق (isSuspended) المنتج
export const toggleProductSuspension = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    product.isSuspended = !product.isSuspended;
    await product.save();

    res.status(200).json({ message: `تم تحديث حالة التعليق إلى ${product.isSuspended ? "معلق" : "مفعل"}` });
  } catch (error) {
    console.error("Error toggling suspension:", error);
    res.status(500).json({ message: "خطأ في تحديث حالة المنتج" });
  }
};

//إخفاء / إظهار المنتج (isHidden)
export const toggleProductVisibility = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    product.isHidden = !product.isHidden;
    await product.save();

    res.status(200).json({ message: `تم تحديث حالة الإخفاء إلى ${product.isHidden ? "مخفي" : "ظاهر"}` });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    res.status(500).json({ message: "خطأ في تحديث حالة الإخفاء" });
  }
};


//حذف المنتج (مثلاً حذف منطقي أو فعلي حسب اختيارك)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    res.status(200).json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "خطأ في حذف المنتج" });
  }
};

