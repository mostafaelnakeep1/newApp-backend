import { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import User from "../models/User";
import mongoose from "mongoose";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const usersCount = await User.countDocuments();

    // الأجهزة المباعة شهريًا (يعني عدد الطلبات في كل شهر)
    const monthlySales = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: "خطأ أثناء جلب البيانات", error });
  }
};


export const getCompanySalesStats = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user.id;

    // 1. نجيب المنتجات بتاعت الشركة
    const products = await Product.find({ companyId }).select("_id");

    const productIds = products.map((p) => p._id);

    // 2. نجيب الطلبات المرتبطة بمنتجات الشركة
    const sales = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب مبيعات الشركة", error });
  }
};
