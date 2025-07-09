import { Request, Response } from "express";
import Offer from "../models/Offer"; // موديل العروض

// جلب العروض المقبولة فقط
export const getApprovedOffers = async (req: Request, res: Response) => {
  try {
    // افتراض: الحقل status يحتوي على "approved" للعروض المقبولة
    const offers = await Offer.find({ status: "approved" })
      .populate("company", "name") // لو حابب تجيب اسم الشركة المرتبطة
      .select("-__v"); // استبعاد بعض الحقول لو تحب

    res.json({ success: true, offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "حدث خطأ في جلب العروض" });
  }
};


