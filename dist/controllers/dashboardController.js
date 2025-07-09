"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanySalesStats = exports.getDashboardStats = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const getDashboardStats = async (req, res) => {
    try {
        const productsCount = await Product_1.default.countDocuments();
        const ordersCount = await Order_1.default.countDocuments();
        const usersCount = await User_1.default.countDocuments();
        // الأجهزة المباعة شهريًا (يعني عدد الطلبات في كل شهر)
        const monthlySales = await Order_1.default.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            {
                                $cond: [
                                    { $lt: ["$_id.month", 10] },
                                    { $concat: ["0", { $toString: "$_id.month" }] },
                                    { $toString: "$_id.month" },
                                ],
                            },
                        ],
                    },
                    count: 1,
                },
            },
        ]);
        res.json({
            productsCount,
            ordersCount,
            usersCount,
            monthlySales,
        });
    }
    catch (error) {
        res.status(500).json({ message: "خطأ أثناء جلب البيانات", error });
    }
};
exports.getDashboardStats = getDashboardStats;
const getCompanySalesStats = async (req, res) => {
    try {
        const companyId = req.user.id;
        // 1. نجيب المنتجات بتاعت الشركة
        const products = await Product_1.default.find({ companyId }).select("_id");
        const productIds = products.map((p) => p._id);
        // 2. نجيب الطلبات المرتبطة بمنتجات الشركة
        const sales = await Order_1.default.aggregate([
            { $match: { productId: { $in: productIds } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            {
                                $cond: [
                                    { $lt: ["$_id.month", 10] },
                                    { $concat: ["0", { $toString: "$_id.month" }] },
                                    { $toString: "$_id.month" },
                                ],
                            },
                        ],
                    },
                    count: 1,
                },
            },
        ]);
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ message: "فشل في جلب مبيعات الشركة", error });
    }
};
exports.getCompanySalesStats = getCompanySalesStats;
