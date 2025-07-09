import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Company from "../models/Company";
import Notification from "../models/Notification";
import { generateCode } from "../utils/generateCode";


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// 🔹 إنشاء التوكن
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};
const resetCodes = new Map();
// 🔹 تسجيل مستخدم جديد

// ✅ register بعد التعديل لتفادي إنشاء حساب User للشركة قبل موافقة الإدارة
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      coverageAreas,
      location,
    } = req.body;

    // تحقق من الحقول الأساسية
    if (!name || !email || !role || (role === "client" && !password)) {
      return res.status(400).json({ message: "جميع الحقول الأساسية مطلوبة" });
    }

    if (!["client", "company"].includes(role)) {
      return res.status(400).json({ message: "نوع الدور غير صالح" });
    }

    // تحقق من صحة البريد الإلكتروني
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "البريد الإلكتروني غير صالح" });
    }

    // تحقق من كلمة السر فقط لو عميل
    if (role === "client" && (!password || password.length < 6)) {
      return res.status(400).json({ message: "كلمة السر ضعيفة، يجب أن تكون 6 أحرف على الأقل" });
    }

    // تأكد إن الإيميل مش مستخدم في User أو Company
    const userExists = await User.findOne({ email });
    const companyExists = await Company.findOne({ email });
    if (userExists || companyExists) {
      return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
    }

    // باسورد افتراضي للشركات
    const finalPassword = role === "company" ? "company123" : password;
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    if (role === "company") {
      const defaultCoverage = ["القاهرة"];
      const defaultAddress = "القاهرة - التحرير";
      
      let parsedLocation: { latitude: number; longitude: number } | null = null;

      const parsedCoverage = ["القاهرة"];

      try {
        parsedLocation = JSON.parse(location);
      } catch {
        return res.status(400).json({ message: "الموقع الجغرافي غير صالح (ليست JSON)" });
      }

      const newCompany = new Company({
        name,
        email,
        phone,
        password: hashedPassword,
        address: defaultAddress,
        coverageAreas: defaultCoverage,
        location: parsedLocation
          ? {
              type: "Point",
              coordinates: [parsedLocation.longitude, parsedLocation.latitude],
            }
          : undefined,
        image: req.file ? req.file.filename : null,
        status: "pending",
        permissionsGranted: false,
        user: null,
      });

      await newCompany.save();

      const admins = await User.find({ role: "admin" });
      await Promise.all(
        admins.map((admin) =>
          Notification.create({
            userId: admin._id,
            title: "طلب تسجيل شركة جديد",
            message: `الشركة: ${newCompany.name} - ${newCompany.email}`,
            isRead: false,
            type: "طلب شركة",
          })
        )
      );

      return res.status(201).json({
        message: "تم تسجيل الشركة بنجاح، بانتظار موافقة الإدارة",
      });
    }

    // 👤 لو عميل
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const token = generateToken(newUser.id, newUser.role);

    return res.status(201).json({
      message: "تم تسجيل المستخدم بنجاح",
      token,
      user: {
        id: newUser._id,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "خطأ في السيرفر", error });
  }
};






// 🔹 تسجيل الدخول
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // ابحث عن المستخدم مع تجاهل المحذوفين
    const user = await User.findOne({ email, isDeleted: false });
    console.log("User lookup result:", user);

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // قارن كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // لو المستخدم شركة، تحقق من حالة الشركة المرتبطة
    if (user.role === "company") {
      const company = await Company.findOne({ user: user._id });
      console.log("Company lookup result:", company);
      console.log("🏢 Linked company:", company);

      if (!company) {
        console.log("No company linked to user:", user._id);
        return res.status(400).json({ message: "الشركة غير موجودة" });
      }

      if (company.status === "pending") {
        console.log("Company status pending for:", company._id);
        return res.status(403).json({ message: "في انتظار موافقة الإدارة على تفعيل الحساب" });
      }

      if (company.status === "rejected") {
        console.log("Company status rejected for:", company._id);
        return res.status(403).json({ message: "تم رفض طلب تسجيل الشركة" });
      }

      // رجع الرد مع بيانات الشركة ومعلومات المستخدم
      return res.json({
        message: "Login successful",
        token: generateToken(user.id, user.role),
        user: {
          id: user._id,
          role: user.role,
          name: user.name,
          email: user.email,
          status: company.status, // حالة الشركة
        },
      });
    }

    // لو مش شركة، ترجع البيانات عادي (لازم يكون هنا return عشان تمنع استمرار التنفيذ)
    return res.json({
      message: "Login successful",
      token: generateToken(user.id, user.role),
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};




// 🔹 جلب بيانات المستخدم الحالي
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({ message: "User data", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔸 حذف مستخدم (فعلي)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.json({ message: "تم حذف المستخدم بنجاح", deletedUserId: user._id });
  } catch (error) {
    res.status(500).json({ message: "فشل في حذف المستخدم", error });
  }
};

// 🔸 تعديل بيانات مستخدم
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ message: "تم تعديل بيانات المستخدم بنجاح", user });
  } catch (error) {
    res.status(500).json({ message: "فشل في تعديل المستخدم", error });
  }
};

// 🔸 ترقية مستخدم إلى أدمن
export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "المستخدم بالفعل أدمن" });
    }

    user.role = "admin";
    await user.save();

    res.json({ message: "تم ترقية المستخدم إلى أدمن", user });
  } catch (error) {
    res.status(500).json({ message: "فشل في الترقية", error });
  }
};

// تحويل ادمن الى مستخدم عادي
export const demoteAdmin = async (req: Request, res: Response) => {
  console.log("demoteAdmin body:", req.body);
  try {
    console.log("demoteAdmin body:", req.body);
    const { userId } = req.params;
    const { newRole } = req.body; // "client" أو "company"

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (user.role !== "admin") {
      return res.status(400).json({ message: "المستخدم ليس أدمن حالياً" });
    }

    // ❌ منع تحويل الأدمن الأساسي
    if (user.email === "elnakeebm34@gmail.com") {
      return res.status(403).json({ message: "لا يمكن تحويل الأدمن الأساسي" });
    }

    if (!["client", "company"].includes(newRole)) {
      return res.status(400).json({ message: "نوع الدور الجديد غير صالح" });
    }

    user.role = newRole;
    await user.save();

    res.json({ message: `تم تحويل الأدمن إلى ${newRole}`, user });
  } catch (error) {
    res.status(500).json({ message: "فشل في التحويل", error });
  }
};

// تعديل المستخدم لبياناته
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ message: "تم تحديث الملف الشخصي بنجاح", user });
  } catch (error) {
    res.status(500).json({ message: "فشل في تحديث البيانات", error });
  }
};

// تعديل الباسوورد
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "تم تحديث كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تحديث كلمة المرور", error: err });
  }
};

export const updateProfileDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { profileImage, location, coverageAreas } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (profileImage) user.profileImage = profileImage;

    if (location && typeof location.lat === "number" && typeof location.lng === "number") {
      user.location = {
        lat: location.lat,
        lng: location.lng,
      };
    }

    if (Array.isArray(coverageAreas) && user.role === "company") {
      user.coverageAreas = coverageAreas;
    }

    await user.save();

    res.json({ message: "تم تحديث البيانات الإضافية بنجاح", user });
  } catch (err) {
    res.status(500).json({ message: "فشل في تحديث البيانات", error: err });
  }
};

export const softDeleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ message: "المستخدم محذوف بالفعل" });
    }

    user.isDeleted = true;
    await user.save();

    res.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "فشل في حذف المستخدم", error });
  }
};

export const restoreUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.isDeleted) {
      return res.status(404).json({ message: "المستخدم غير موجود أو ليس محذوف" });
    }

    user.isDeleted = false;
    await user.save();

    res.json({ message: "تم استرجاع المستخدم بنجاح", user });
  } catch (error) {
    res.status(500).json({ message: "فشل في استرجاع المستخدم", error });
  }
};

// 🔍 جلب كل المستخدمين مع فلترة وحذف وبحث
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    // بناء الفلتر الديناميكي
    const filter: any = { isDeleted: false };

    if (role && ["client", "company", "admin"].includes(String(role))) {
      filter.role = role;
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({ message: "تم جلب المستخدمين", count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب المستخدمين", error });
  }
};

// 📄 جلب مستخدم واحد بالتفصيل
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({ message: "تم جلب بيانات المستخدم", user });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب المستخدم", error });
  }
};



export const getPendingCompanies = async (req: Request, res: Response) => {
  try {
    const pendingCompanies = await Company.find({ status: "pending" }).lean();
    res.status(200).json({ companies: pendingCompanies });
  } catch (error) {
    console.error("Error fetching pending companies:", error);
    res.status(500).json({ message: "حدث خطأ في جلب بيانات الشركات" });
  }
};


export const approveCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const defaultPassword = "password123"; // كلمة السر الافتراضية

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });

    company.status = "active";
    company.approvedAt = new Date();
    company.rejectedAt = undefined;

    // لو ما عندهاش user مربوط، نعمل حساب مستخدم جديد
    if (!company.user) {
      
      const existingUser = await User.findOne({ email: company.email });
      if (existingUser) {
        // لو موجود بالفعل مستخدم بنفس الإيميل نربطه فقط
        company.user = existingUser._id;
      } else {
        const defaultPassword = "password123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = new User({
          name: company.name,
          email: company.email,
          password: hashedPassword,
          role: "company",
        });

        await newUser.save();
        company.user = newUser._id;
      }
    }

    await company.save();

    res.json({ message: "تم قبول الشركة وربط حساب المستخدم بنجاح" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "فشل في قبول الشركة", error });
  }
};


export const rejectCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });

    company.status = "rejected";
    company.rejectedAt = new Date();     // ✅ أضف تاريخ الرفض
    company.approvedAt = undefined;      // 🧹 إزالة أي تاريخ تفعيل سابق

    await company.save();

    res.json({ message: "تم رفض الشركة" });
  } catch (error) {
    res.status(500).json({ message: "فشل في رفض الشركة", error });
  }
};

export const sendResetCode = async (req: Request, res: Response) => {
  const { phone, email } = req.body;
  console.log("🔍 Body received:", req.body);

  if (!phone || !email)
    return res.status(400).json({ message: "رقم الهاتف والإيميل مطلوبان" });

  const user = await User.findOne({ phone, email });
  if (!user)
    return res.status(404).json({ message: "لا يوجد مستخدم بهذه البيانات" });

  const code = generateCode();
  resetCodes.set(phone + email, code);

  console.log(`📲 كود التفعيل: ${code}`);

  return res.status(200).json({ message: "تم إرسال الكود بنجاح" });
};


export const verifyResetCode = async (req: Request, res: Response) => {
  const { phone, email, code } = req.body;
  const savedCode = resetCodes.get(phone + email);
  if (code !== savedCode) {
    return res.status(400).json({ message: "الكود غير صحيح" });
  }

  return res.status(200).json({ message: "تم التحقق من الكود" });
};


export const resetPassword = async (req: Request, res: Response) => {
  const { phone, email, code, newPassword } = req.body;

  const savedCode = resetCodes.get(phone + email);
  if (code !== savedCode) {
    return res.status(400).json({ message: "الكود غير صحيح" });
  }

  const user = await User.findOne({ phone, email });
  if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

  user.password = newPassword; // لازم تشفير لو فيه
  await user.save();

  resetCodes.delete(phone + email);

  return res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
};
