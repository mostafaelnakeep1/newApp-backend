import { Request, Response } from "express";
import Offer from "../models/Offer";

// ✅ اعتماد العرض
export const approveOffer = async (req: Request, res: Response) => {
  try {
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "العرض غير موجود" });
    }

    offer.status = "approved";
    await offer.save();

    res.json({ message: "تمت الموافقة على العرض بنجاح", offer });
  } catch (error) {
    console.error("approveOffer error:", error);
    res.status(500).json({ message: "فشل في الموافقة على العرض" });
  }
};

// ❌ رفض العرض
export const rejectOffer = async (req: Request, res: Response) => {
  try {
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "العرض غير موجود" });
    }

    offer.status = "rejected";
    await offer.save();

    res.json({ message: "تم رفض العرض بنجاح", offer });
  } catch (error) {
    console.error("rejectOffer error:", error);
    res.status(500).json({ message: "فشل في رفض العرض" });
  }
};


// ⬇ GET /admin/offers/pending
export const getPendingOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.find({ status: "pending" }).populate("company", "name");
    res.json({ offers });
  } catch (error) {
    res.status(500).json({ message: "فشل جلب العروض" });
  }
};


// حذف العرض
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const offerId = req.params.id;
    const deleted = await Offer.findByIdAndDelete(offerId);
    if (!deleted) {
      return res.status(404).json({ message: "العرض غير موجود" });
    }
    res.json({ message: "تم حذف العرض بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
};