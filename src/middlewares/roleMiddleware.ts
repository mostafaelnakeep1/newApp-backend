import type { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
// تعريف Request جديد مع user
export interface AuthRequest extends Request {
  user?: IUser; 
}

// دوال التفويض
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("🔐 User role =>", req.user?.role);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admins only" });
  }
  next();
};
