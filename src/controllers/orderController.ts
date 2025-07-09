import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import Company from "../models/Company";

// ✅ إنشاء طلب جديد (client فقط)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { products } = req.body; // [{ productId, quantity }]
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "يجب إضافة منتجات للطلب" });
    }

    let totalPrice = 0;
    const companyIds = new Set<string>();

    // تحقق وجود المنتجات وحساب السعر الكلي وجمع شركات المنتجات
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `المنتج ${item.productId} غير موجود` });
      }
      if (!product.company) {
        return res.status(404).json({ message: `الشركة الخاصة بالمنتج ${item.productId} غير موجودة` });
      }
      totalPrice += product.price * item.quantity;
      companyIds.add(product.company.toString());
    }

    if (companyIds.size > 1) {
      return res.status(400).json({ message: "الطلب يجب أن يكون من شركة واحدة فقط" });
    }

    const companyId = [...companyIds][0];

    // إنشاء الطلب
    const newOrder = await Order.create({
      clientId,
      companyId,
      products,
      totalPrice,
      status: "pending",
    });

    // تحديث علاقة الشركة مع العميل (لو مش مضافة قبل كده) وتحديث آخر تعامل
    await Company.findByIdAndUpdate(companyId, {
      $addToSet: { interactedClients: clientId },
      lastInteraction: new Date(),
    });

    res.status(201).json({ message: "تم إنشاء الطلب", data: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الطلب" });
  }
};

// ✅ جلب الطلبات مع فلترة ودعم الأدوار والـ pagination
export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const { page = "1", limit = "10", status, keyword = "", userId } = req.query;
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    let filter: any = {};

    if (user.role === "client") {
      filter.clientId = user.id;
    } else if (user.role === "company") {
      filter.companyId = user.id;
    } else if (user.role === "admin" && userId) {
      filter.clientId = userId;
    }

    if (status && ["pending", "in_progress", "completed", "rejected"].includes(String(status))) {
      filter.status = status;
    }

    if (keyword) {
      filter.$or = [
        { "products.productId.name": { $regex: keyword, $options: "i" } },
        { "clientId.name": { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("clientId", "name email")
      .populate("companyId", "name email")
      .populate("products.productId", "name price")
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .sort({ createdAt: -1 });

    res.json({
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit),
      totalItems: total,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الطلبات", error });
  }
};


// ✅ تحديث حالة الطلب أو أي بيانات (لـ company, admin)
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status && !["pending", "in_progress", "completed", "rejected"].includes(updates.status)) {
      return res.status(400).json({ message: "حالة الطلب غير صحيحة" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    res.json({ message: "تم تحديث الطلب", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التحديث", error });
  }
};

// تحديث حالة الطلب فقط
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // تأكد إن الحالة موجودة وجديدة
    if (!status) {
      return res.status(400).json({ message: "يجب تحديد حالة جديدة للطلب" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    res.json({ message: "تم تحديث حالة الطلب", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث حالة الطلب", error });
  }
};

// ✅ حذف طلب (admin فقط)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    res.json({ message: "تم حذف الطلب بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "فشل في حذف الطلب", error });
  }
};


//تقييم المنتج

export const rateOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { ratingForProduct, ratingForCompany, reviewComment } = req.body;

    const order = await Order.findById(orderId);
    if (!order || !order.clientId.equals(req.user?.id)) {
      return res.status(403).json({ message: "طلب غير صالح" });
    }

    order.ratingForProduct = ratingForProduct;
    order.ratingForCompany = ratingForCompany;
    order.reviewComment = reviewComment;

    await order.save();

    res.json({ message: "تم التقييم بنجاح", order });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التقييم", error });
  }
};

// ✅ جلب الطلبات مع فلترة ودعم الأدوار والـ pagination
export const getOrdersByAdmin = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const { page = "1", limit = "10", status, keyword = "", userId } = req.query;
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    let filter: any = {};

    if (user.role === "client") {
      filter.clientId = user.id;
    } else if (user.role === "company") {
      filter.companyId = user.id;
    } else if (user.role === "admin") {
      if (userId) {
        filter.clientId = userId;
      }
      // لو مفيش userId، يشوف الكل
    }

    if (status && ["pending", "in_progress", "completed", "rejected"].includes(String(status))) {
      filter.status = status;
    }

    if (keyword) {
      filter.$or = [
        { "products.productId.name": { $regex: keyword, $options: "i" } },
        { "clientId.name": { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("clientId", "name email")
      .populate("companyId", "name email")
      .populate("products.productId", "name price")
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .sort({ createdAt: -1 });

    res.json({
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit),
      totalItems: total,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الطلبات", error });
  }
};

