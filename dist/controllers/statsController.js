"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyRankThisMonth = exports.updateCompanySuspension = exports.getCompanySalesStats = exports.getAdminStats = exports.getCompaniesWithRemainingDays = exports.getSuspendedCompanies = exports.getTopBrandsStats = exports.getTopCompaniesStats = exports.getMonthlySales = exports.getTotalSales = exports.getCompanyCount = exports.getClientCount = void 0;
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
// 🔹 جلب عدد العملاء
const getClientCount = async (req, res) => {
    try {
        const count = await User_1.default.countDocuments({ role: "client" });
        res.json({ totalClients: count });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في جلب عدد العملاء", error });
    }
};
exports.getClientCount = getClientCount;
// 🔹 جلب عدد الشركات
const getCompanyCount = async (req, res) => {
    try {
        const count = await User_1.default.countDocuments({ role: "company" });
        res.json({ totalCompanies: count });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في جلب عدد الشركات", error });
    }
};
exports.getCompanyCount = getCompanyCount;
// 🔹 إجمالي عدد الأجهزة المباعة (كل الطلبات)
const getTotalSales = async (req, res) => {
    try {
        const result = await Order_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const total = result[0]?.total || 0;
        res.json({ totalDevicesSold: total });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في حساب إجمالي المبيعات", error });
    }
};
exports.getTotalSales = getTotalSales;
// 🔹 عدد الأجهزة المباعة في كل شهر (آخر 6 شهور مثلًا)
const getMonthlySales = async (req, res) => {
    try {
        const result = await Order_1.default.aggregate([
            {
                $group: {
                    _id: { $substr: ["$createdAt", 0, 7] },
                    total: { $sum: "$quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({ monthlySales: result });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في حساب المبيعات الشهرية", error });
    }
};
exports.getMonthlySales = getMonthlySales;
// 🔹 أعلى الشركات مبيعًا (حسب الكمية والمبلغ)
const getTopCompaniesStats = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const topCompaniesMonthly = await Order_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
                $group: {
                    _id: "$companyId",
                    totalQuantity: { $sum: "$quantity" },
                    totalAmount: { $sum: "$totalPrice" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "companyInfo",
                },
            },
            { $unwind: "$companyInfo" },
        ]);
        const topCompaniesOverall = await Order_1.default.aggregate([
            {
                $group: {
                    _id: "$companyId",
                    totalQuantity: { $sum: "$quantity" },
                    totalAmount: { $sum: "$totalPrice" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "companyInfo",
                },
            },
            { $unwind: "$companyInfo" },
        ]);
        res.json({ topCompaniesMonthly, topCompaniesOverall });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في جلب إحصائيات الشركات", error });
    }
};
exports.getTopCompaniesStats = getTopCompaniesStats;
// 🔹 أعلى البراندات مبيعًا (حسب الكمية والمبلغ)
const getTopBrandsStats = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const topBrandsMonthly = await Order_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.brand",
                    totalQuantity: { $sum: "$quantity" },
                    totalAmount: { $sum: "$totalPrice" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
        ]);
        const topBrandsOverall = await Order_1.default.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.brand",
                    totalQuantity: { $sum: "$quantity" },
                    totalAmount: { $sum: "$totalPrice" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
        ]);
        res.json({ topBrandsMonthly, topBrandsOverall });
    }
    catch (error) {
        res.status(500).json({ message: "فشل في جلب إحصائيات البراندات", error });
    }
};
exports.getTopBrandsStats = getTopBrandsStats;
const getSuspendedCompanies = async (req, res) => {
    const suspendedCompanies = await User_1.default.find({ role: "company", isSuspended: true });
    res.json({ suspendedCompanies });
};
exports.getSuspendedCompanies = getSuspendedCompanies;
const getCompaniesWithRemainingDays = async (req, res) => {
    const companies = await User_1.default.find({ role: "company" });
    // حساب الأيام المتبقية لتعليق الشركة
};
exports.getCompaniesWithRemainingDays = getCompaniesWithRemainingDays;
const getAdminStats = async (req, res) => {
    const usersCount = await User_1.default.countDocuments({ role: "client" });
    const companiesCount = await User_1.default.countDocuments({ role: "company" });
    const productsCount = await Product_1.default.countDocuments();
    const ordersCount = await Order_1.default.countDocuments();
    // حساب إجمالي ومبيعات الشهر
};
exports.getAdminStats = getAdminStats;
const getCompanySalesStats = async (req, res) => {
    const { companyId } = req.params;
    const result = await Order_1.default.aggregate([
        { $match: { companyId } },
        // ...
    ]);
};
exports.getCompanySalesStats = getCompanySalesStats;
// 🔸 تعليق أو إلغاء تعليق أو تمديد مدة شركة
const updateCompanySuspension = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { action, newDays } = req.body;
        const company = await User_1.default.findById(companyId);
        if (!company || company.role !== "company") {
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }
        if (action === "unsuspend") {
            // إلغاء التعليق وإعادة تفعيل الاشتراك
            company.isSuspended = false;
            company.activatedAt = new Date(); // تعيين تاريخ التفعيل الجديد
        }
        else if (action === "extend" && newDays) {
            // تمديد عدد أيام التعليق/الاشتراك
            company.suspendAfterDays = newDays;
        }
        else {
            return res.status(400).json({ message: "إجراء غير صحيح أو بيانات ناقصة" });
        }
        await company.save();
        res.json({ message: "تم تحديث حالة الشركة بنجاح", company });
    }
    catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء تعديل حالة الشركة", error });
    }
};
exports.updateCompanySuspension = updateCompanySuspension;
//تحديد ترتيب الشركة بين الشركات
const getCompanyRankThisMonth = async (req, res) => {
    const companyId = req.params.companyId;
    if (!mongoose_1.default.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: "رقم شركة غير صالح" });
    }
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const result = await Order_1.default.aggregate([
            {
                $match: {
                    status: "تم التركيب",
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: "$company",
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { totalOrders: -1 } },
        ]);
        // نحدد ترتيب الشركة
        const rank = result.findIndex((entry) => entry._id.toString() === companyId) + 1;
        if (rank === 0) {
            return res.status(404).json({ message: "الشركة لم تحقق مبيعات هذا الشهر" });
        }
        const companyData = result.find((entry) => entry._id.toString() === companyId);
        res.json({
            message: "تم جلب ترتيب الشركة",
            rank,
            totalCompanies: result.length,
            totalOrders: companyData?.totalOrders || 0,
        });
    }
    catch (error) {
        res.status(500).json({ message: "خطأ في حساب الترتيب", error });
    }
};
exports.getCompanyRankThisMonth = getCompanyRankThisMonth;
