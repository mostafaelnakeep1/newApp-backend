"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovedOffers = void 0;
const Offer_1 = __importDefault(require("../models/Offer")); // موديل العروض
// جلب العروض المقبولة فقط
const getApprovedOffers = async (req, res) => {
    try {
        // افتراض: الحقل status يحتوي على "approved" للعروض المقبولة
        const offers = await Offer_1.default.find({ status: "approved" })
            .populate("company", "name") // لو حابب تجيب اسم الشركة المرتبطة
            .select("-__v"); // استبعاد بعض الحقول لو تحب
        res.json({ success: true, offers });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "حدث خطأ في جلب العروض" });
    }
};
exports.getApprovedOffers = getApprovedOffers;
