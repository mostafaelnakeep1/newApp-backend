import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";  // استدعاء دالة الاتصال بقاعدة البيانات
import path from "path";

import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import companyRoutes from "./routes/companyRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import adRoutes from "./routes/adRoutes"; 
import statsRoutes from "./routes/stats";
import notificationRoutes from "./routes/notificationRoutes";
import profileRoutes from "./routes/profileRoutes";

import { suspendCompaniesJob } from "./jops/suspendCompaniesJob";
import publicCompanyRoutes from "./routes/publicCompanyRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { attachUser } from "./middlewares/attachUser";
import { protect } from "./middlewares/authMiddleware";
import offerRoutes from "./routes/offerRoutes";
import fs from "fs";


dotenv.config();
connectDB();

const app = express();


const uploadsPath = path.join(__dirname, "../uploads");
const defaultImagePath = path.join(uploadsPath, "default.jpg");

app.use("/uploads", (req, res, next) => {
  const requestedFile = path.join(uploadsPath, req.path);

  fs.access(requestedFile, fs.constants.F_OK, (err) => {
    if (err) {
      // الملف مش موجود، رجع الصورة الافتراضية
      res.sendFile(defaultImagePath);
    } else {
      // الملف موجود، كمل على express.static
      next();
    }
  });
});

app.use("/uploads", express.static(uploadsPath));
app.use("/api/offers", offerRoutes);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
   console.log(">>>> Authorization Header:", req.headers.authorization);
  next();
});
app.use((req, res, next) => {
  console.log(`📥 Request to: ${req.method} ${req.originalUrl}`);
  next();
});

// الراوتات المفتوحة (بدون حماية)
app.use("/api/auth", authRoutes);

// ملفات الاستاتيك المفتوحة
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads/ads", express.static(path.join(__dirname, "../uploads/ads")));
app.use("/api/companies", publicCompanyRoutes);
// بعدها نفعّل الحماية لكل الراوتات اللي بعدها
app.use(protect);
app.use((req, res, next) => {
  console.log("➡️ Middleware 1: قبل attachUser");
  next();
});

app.use(attachUser);

app.use((req, res, next) => {
  console.log("➡️ Middleware 2: بعد attachUser");
  next();
});




// الراوتات المحمية (تحتاج توكن)


app.use("/api/admin", adminRoutes);

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);


app._router.stack
  .filter((r: any) => r.route)
  .map((r: any) => console.log(r.route?.path, Object.keys(r.route?.methods)));


// تشغيل المهمة المجدولة
suspendCompaniesJob();

const PORT = process.env.PORT || 5001;
app.listen(PORT,  () => {
  console.log(`Server running on port ${PORT}`);
});