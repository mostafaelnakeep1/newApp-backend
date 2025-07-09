"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOffer = exports.getPendingOffers = exports.rejectOffer = exports.approveOffer = void 0;
const Offer_1 = __importDefault(require("../models/Offer"));
// ✅ اعتماد العرض
const approveOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer_1.default.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "العرض غير موجود" });
        }
        offer.status = "approved";
        await offer.save();
        res.json({ message: "تمت الموافقة على العرض بنجاح", offer });
    }
    catch (error) {
        console.error("approveOffer error:", error);
        res.status(500).json({ message: "فشل في الموافقة على العرض" });
    }
};
exports.approveOffer = approveOffer;
// ❌ رفض العرض
const rejectOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer_1.default.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: "العرض غير موجود" });
        }
        offer.status = "rejected";
        await offer.save();
        res.json({ message: "تم رفض العرض بنجاح", offer });
    }
    catch (error) {
        console.error("rejectOffer error:", error);
        res.status(500).json({ message: "فشل في رفض العرض" });
    }
};
exports.rejectOffer = rejectOffer;
// ⬇ GET /admin/offers/pending
const getPendingOffers = async (_req, res) => {
    try {
        const offers = await Offer_1.default.find({ status: "pending" }).populate("company", "name");
        res.json({ offers });
    }
    catch (error) {
        res.status(500).json({ message: "فشل جلب العروض" });
    }
};
exports.getPendingOffers = getPendingOffers;
// حذف العرض
const deleteOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const deleted = await Offer_1.default.findByIdAndDelete(offerId);
        if (!deleted) {
            return res.status(404).json({ message: "العرض غير موجود" });
        }
        res.json({ message: "تم حذف العرض بنجاح" });
    }
    catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
    }
};
exports.deleteOffer = deleteOffer;
