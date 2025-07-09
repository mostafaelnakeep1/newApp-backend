"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suspendCompaniesJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
// المهمة هتشتغل كل يوم الساعة 12 منتصف الليل
const suspendCompaniesJob = () => {
    node_cron_1.default.schedule("0 0 * * *", async () => {
        console.log("Running suspendCompaniesJob - checking companies suspension status...");
        const today = new Date();
        try {
            // نجلب كل الشركات اللي مش معلقة حالياً
            const companies = await User_1.default.find({
                role: "company",
                isSuspended: false,
            });
            for (const company of companies) {
                if (!company.activatedAt)
                    continue;
                const activatedAt = new Date(company.activatedAt);
                const diffDays = Math.floor((today.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays >= (company.suspendAfterDays ?? 30)) {
                    company.isSuspended = true;
                    await company.save();
                    console.log(`Company ${company._id} suspended automatically after ${diffDays} days.`);
                }
            }
        }
        catch (error) {
            console.error("Error running suspendCompaniesJob:", error);
        }
    });
};
exports.suspendCompaniesJob = suspendCompaniesJob;
