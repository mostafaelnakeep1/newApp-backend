import { Request, Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import Product from "../models/Product";
import mongoose from "mongoose";

// 🔹 جلب عدد العملاء
export const getClientCount = async (req: Request, res: Response) => {
  try {
    const count = await User.countDocuments({ role: "client" });
    res.json({ totalClients: count });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب عدد العملاء", error });
  }
};

// 🔹 جلب عدد الشركات
export const getCompanyCount = async (req: Request, res: Response) => {
  try {
    const count = await User.countDocuments({ role: "company" });
    res.json({ totalCompanies: count });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب عدد الشركات", error });
  }
};

// 🔹 إجمالي عدد الأجهزة المباعة (كل الطلبات)
export const getTotalSales = async (req: Request, res: Response) => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const total = result[0]?.total || 0;
    res.json({ totalDevicesSold: total });
  } catch (error) {
    res.status(500).json({ message: "فشل في حساب إجمالي المبيعات", error });
  }
};

// 🔹 عدد الأجهزة المباعة في كل شهر (آخر 6 شهور مثلًا)
export const getMonthlySales = async (req: Request, res: Response) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 7] },
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ monthlySales: result });
  } catch (error) {
    res.status(500).json({ message: "فشل في حساب المبيعات الشهرية", error });
  }
};

// 🔹 أعلى الشركات مبيعًا (حسب الكمية والمبلغ)
export const getTopCompaniesStats = async (req: Request, res: Response) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topCompaniesMonthly = await Order.aggregate([
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

    const topCompaniesOverall = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب إحصائيات الشركات", error });
  }
};

// 🔹 أعلى البراندات مبيعًا (حسب الكمية والمبلغ)
export const getTopBrandsStats = async (req: Request, res: Response) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topBrandsMonthly = await Order.aggregate([
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

    const topBrandsOverall = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب إحصائيات البراندات", error });
  }
};

export const getSuspendedCompanies = async (req: Request, res: Response) => {
  const suspendedCompanies = await User.find({ role: "company", isSuspended: true });
  res.json({ suspendedCompanies });
};

export const getCompaniesWithRemainingDays = async (req: Request, res: Response) => {
  const companies = await User.find({ role: "company" });
  // حساب الأيام المتبقية لتعليق الشركة
};

export const getAdminStats = async (req: Request, res: Response) => {
  const usersCount = await User.countDocuments({ role: "client" });
  const companiesCount = await User.countDocuments({ role: "company" });
  const productsCount = await Product.countDocuments();
  const ordersCount = await Order.countDocuments();
  // حساب إجمالي ومبيعات الشهر
};

export const getCompanySalesStats = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const result = await Order.aggregate([
    { $match: { companyId } },
    // ...
  ]);
};

// 🔸 تعليق أو إلغاء تعليق أو تمديد مدة شركة
export const updateCompanySuspension = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { action, newDays } = req.body;

    const company = await User.findById(companyId);

    if (!company || company.role !== "company") {
      return res.status(404).json({ message: "الشركة غير موجودة" });
    }

    if (action === "unsuspend") {
      // إلغاء التعليق وإعادة تفعيل الاشتراك
      company.isSuspended = false;
      company.activatedAt = new Date(); // تعيين تاريخ التفعيل الجديد
    } else if (action === "extend" && newDays) {
      // تمديد عدد أيام التعليق/الاشتراك
      company.suspendAfterDays = newDays;
    } else {
      return res.status(400).json({ message: "إجراء غير صحيح أو بيانات ناقصة" });
    }

    await company.save();

    res.json({ message: "تم تحديث حالة الشركة بنجاح", company });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء تعديل حالة الشركة", error });
  }
};


//تحديد ترتيب الشركة بين الشركات
export const getCompanyRankThisMonth = async (req: Request, res: Response) => {
  const companyId = req.params.companyId;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({ message: "رقم شركة غير صالح" });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: "خطأ في حساب الترتيب", error });
  }
};