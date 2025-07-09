"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveExpoPushToken = exports.getPreviousCompanies = exports.deleteUser = exports.updateUser = exports.filterUsers = exports.toggleVisibilityStatus = exports.toggleSuspendStatus = exports.deleteUserPermanently = exports.adminUpdateUser = exports.updateOwnProfile = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Company_1 = __importDefault(require("../models/Company"));
const Order_1 = __importDefault(require("../models/Order"));
// جلب كل المستخدمين بدون الباسورد
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        // جيب المستخدمين حسب الفلتر بدون الباسورد
        const users = await User_1.default.find(filter).select("-password");
        // ⏱️ لو حابب تضيف ordersCount لكل عميل:
        const usersWithOrders = await Promise.all(users.map(async (user) => {
            const ordersCount = await Order_1.default.countDocuments({ clientId: user._id });
            return {
                ...user.toObject(),
                ordersCount,
            };
        }));
        res.json({ users: usersWithOrders });
    }
    catch (error) {
        console.error("getUsers error:", error);
        res.status(500).json({ message: "فشل في جلب المستخدمين", error });
    }
};
exports.getUsers = getUsers;
// جلب مستخدم معين بالآي دي
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getUserById = getUserById;
// 👤 تعديل بيانات المستخدم لنفسه (client / company)
const updateOwnProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { name, email, phone, avatar } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "المستخدم غير موجود" });
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (phone)
            user.phone = phone;
        if (avatar)
            user.avatar = avatar;
        await user.save();
        res.status(200).json({
            message: "تم تحديث البيانات بنجاح",
            user,
        });
    }
    catch (err) {
        console.error("❌ updateOwnProfile error:", err);
        res.status(500).json({ message: "حدث خطأ أثناء تحديث البيانات" });
    }
};
exports.updateOwnProfile = updateOwnProfile;
// تعديل مستخدم مع دعم تعليق وإخفاء الشركة (للشركات فقط)
const adminUpdateUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // تحديث الحقول المسموح بيها (name, email, role)
        const { name, email, role, isSuspended, isHidden } = req.body;
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (role && ["client", "company", "admin"].includes(role)) {
            user.role = role;
        }
        // تحديث حالات تعليق وإخفاء الشركة إذا كانت شركة
        if (user.role === "company") {
            if (typeof isSuspended === "boolean")
                user.isSuspended = isSuspended;
            if (typeof isHidden === "boolean")
                user.isHidden = isHidden;
        }
        await user.save();
        res.json({ message: "User updated", user });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.adminUpdateUser = adminUpdateUser;
// حذف مستخدم مع حماية الأدمن الأساسي (مثلاً ID معين)
const deleteUserPermanently = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // حماية الأدمن الأساسي (مثلاً ID ثابت أو ممكن تعديله)
        const primaryAdminId = "ادخل_هنا_الايدي_بتاع_الأدمن_الأساسي";
        const userId = user._id.toString();
        if (userId === primaryAdminId) {
            return res.status(403).json({ message: "لا يمكن حذف الأدمن الأساسي" });
        }
        await user.deleteOne();
        res.json({ message: "User deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.deleteUserPermanently = deleteUserPermanently;
// ✅ تعليق أو إلغاء تعليق شركة
const toggleSuspendStatus = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user || user.role !== "company") {
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }
        user.isSuspended = req.body.isSuspended;
        await user.save();
        res.json({
            message: `تم ${user.isSuspended ? "تعليق" : "إلغاء تعليق"} الشركة`,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "خطأ في تغيير حالة التعليق", error });
    }
};
exports.toggleSuspendStatus = toggleSuspendStatus;
// ✅ إخفاء أو إلغاء إخفاء شركة
const toggleVisibilityStatus = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user || user.role !== "company") {
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }
        user.isHidden = req.body.isHidden;
        await user.save();
        res.json({
            message: `تم ${user.isHidden ? "إخفاء" : "إلغاء إخفاء"} الشركة`,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "خطأ في تغيير حالة الإخفاء", error });
    }
};
exports.toggleVisibilityStatus = toggleVisibilityStatus;
const filterUsers = async (req, res) => {
    try {
        const { role, search, from, to, isSuspended, sortBy, order } = req.query;
        const filter = { isDeleted: false };
        if (role && ["client", "company", "admin"].includes(String(role))) {
            filter.role = role;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        if (typeof isSuspended !== "undefined") {
            filter.isSuspended = isSuspended === "true";
        }
        // 🔹 الفرز
        let sort = {};
        const allowedSortFields = ["name", "email", "createdAt", "role"];
        const sortByParam = String(sortBy || "");
        const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;
        sort[sortField] = sortOrder;
        const users = await User_1.default.find(filter).sort(sort).select("-password");
        res.json({ users });
    }
    catch (err) {
        res.status(500).json({ message: "فشل في الفلترة", error: err });
    }
};
exports.filterUsers = filterUsers;
// ✅ تعديل بيانات مستخدم
const updateUser = async (req, res) => {
    if (!req.user || req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: "ليس لديك صلاحية تعديل هذا الحساب" });
    }
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedUser = await User_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        res.json({ message: "تم تحديث بيانات المستخدم", user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "خطأ أثناء التحديث", error });
    }
};
exports.updateUser = updateUser;
// ✅ حذف مستخدم
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User_1.default.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        res.json({ message: "تم حذف المستخدم بنجاح" });
    }
    catch (error) {
        res.status(500).json({ message: "خطأ أثناء الحذف", error });
    }
};
exports.deleteUser = deleteUser;
const getPreviousCompanies = async (req, res) => {
    try {
        const userId = req.user.id;
        // مثال: جلب الشركات اللي ليها تعامل سابق مع العميل
        const companies = await Company_1.default.find({ interactedClients: userId });
        res.json({
            success: true,
            data: companies,
        });
    }
    catch (error) {
        console.error("Error in getPreviousCompanies:", error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب الشركات السابقة" });
    }
};
exports.getPreviousCompanies = getPreviousCompanies;
const saveExpoPushToken = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { token } = req.body;
        if (!userId || !token) {
            return res.status(400).json({ message: "Invalid token or user" });
        }
        // حاول تحدث يوزر أو شركة
        const updatedUser = (await User_1.default.findByIdAndUpdate(userId, { expoPushToken: token }, { new: true })) ||
            (await Company_1.default.findByIdAndUpdate(userId, { expoPushToken: token }, { new: true }));
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Push token saved successfully" });
    }
    catch (error) {
        console.error("Error saving push token:", error);
        res.status(500).json({ message: "Server error while saving token" });
    }
};
exports.saveExpoPushToken = saveExpoPushToken;
