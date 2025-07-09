import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User"; // مفيش داعي لـ Company طالما الكل هنا

export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("🔥 attachUser middleware loaded");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("🚫 No token provided");
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };

    console.log("🧩 Decoded Token:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    req.user = {
      ...user.toObject(),
      role: decoded.role,
    } as any;

    next();
  } catch (err) {
    console.error("💥 Error in attachUser:", err);
    res.status(401).json({ message: "Token غير صالح أو منتهي" });
  }
};
