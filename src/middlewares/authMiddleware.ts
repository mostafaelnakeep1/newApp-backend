import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

interface JwtPayload {
  id: string;
  role: "client" | "company" | "admin";
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Authorization header:", req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // نجيب بيانات المستخدم كاملة من الداتا بيس
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("user role =>", user.role);

    // نحط بيانات المستخدم في req.user
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
