// controllers/adController.ts
import { Request, Response } from "express";
import Ad from "../models/Ad";

export const addAd = async (req: Request, res: Response) => {
  try {
    const { position, durationDays } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "فيديو الإعلان مطلوب" });
    }

    if (!position || !durationDays) {
      return res.status(400).json({ message: "البيانات ناقصة" });
    }

     // حساب تاريخ انتهاء الإعلان
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(durationDays));

    const ad = new Ad({
      video: req.file.filename,
      position,
      durationDays,
      expiryDate,
      status: "active",
    });

    await ad.save();

    res.status(201).json({ message: "تم إضافة الإعلان بنجاح", ad });
  } catch (error) {
    res.status(500).json({ message: "فشل في إضافة الإعلان", error });
  }
};

export const getActiveAds = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const ads = await Ad.find().sort({ position: 1 });

    const activeAds = ads.filter((ad) => {
      const expiryDate = new Date(ad.createdAt);
      expiryDate.setDate(expiryDate.getDate() + ad.durationDays);
      return now <= expiryDate;
    });

    // نضيف مسار الفيديو الكامل
    const adsWithFullPath = activeAds.map((ad) => ({
      ...ad.toObject(),
      videoUrl: `${req.protocol}://${req.get("host")}/uploads/ads/${ad.video}`,
    }));

    res.json({ ads: adsWithFullPath });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الإعلانات", error });
  }
};



export const updateAd = async (req: Request, res: Response) => {
  try {
    const adId = req.params.id;
    const { status, extendDays, position, durationDays } = req.body;

    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ message: "الإعلان غير موجود" });

    // تعديل الحالة (تعليق أو تفعيل)
    if (status && ["active", "paused"].includes(status)) {
      ad.status = status;
    }

    // تمديد مدة الإعلان
    if (extendDays && typeof extendDays === "number" && extendDays > 0) {
      ad.expiryDate.setDate(ad.expiryDate.getDate() + extendDays);
      ad.durationDays += extendDays;
    }

    // تعديل موضع الإعلان
    if (position !== undefined) {
      ad.position = position;
    }

    // تعديل مدة الإعلان (غير موصى بها إلا لو عايز تعيد الحساب كله)
    if (durationDays) {
      const newExpiryDate = new Date(ad.createdAt);
      newExpiryDate.setDate(newExpiryDate.getDate() + Number(durationDays));
      ad.expiryDate = newExpiryDate;
      ad.durationDays = Number(durationDays);
    }

    await ad.save();

    res.json({ message: "تم تحديث الإعلان بنجاح", ad });
  } catch (error) {
    res.status(500).json({ message: "فشل في تحديث الإعلان", error });
  }
};



export const getAllAds = async (req: Request, res: Response) => {
  try {
    const ads = await Ad.find().sort({ position: 1 });

    const adsWithFullPath = ads.map((ad) => ({
      ...ad.toObject(),
      videoUrl: `${req.protocol}://${req.get("host")}/uploads/ads/${ad.video}`,
    }));
    console.log("🎯 رجع الإعلانات:");
    console.log(adsWithFullPath);
    res.json({ ads: adsWithFullPath });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الإعلانات", error });
  }
};


export const deleteAd = async (req: Request, res: Response) => {
  try {
    const adId = req.params.id;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "الإعلان غير موجود" });
    }

    // لو عايز تحذف الفيديو من المجلد ممكن تضيف هنا كود لحذف الملف (اختياري)

    await ad.deleteOne({ _id: adId });

    res.json({ message: "تم حذف الإعلان بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "فشل في حذف الإعلان", error });
  }
};
