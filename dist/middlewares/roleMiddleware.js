"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authorize = void 0;
// دوال التفويض
const authorize = (roles) => {
    return (req, res, next) => {
        console.log("🔐 User role =>", req.user?.role);
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
};
exports.authorize = authorize;
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: admins only" });
    }
    next();
};
exports.isAdmin = isAdmin;
