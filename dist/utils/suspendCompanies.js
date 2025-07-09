"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSuspendCompanies = void 0;
// utils/suspendCompanies.ts
const User_1 = __importDefault(require("../models/User"));
const autoSuspendCompanies = async () => {
    const now = new Date();
    const companies = await User_1.default.find({ role: "company", isSuspended: false });
    for (const company of companies) {
        const { activatedAt, suspendAfterDays } = company;
        const diffInDays = (now.getTime() - new Date(activatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays >= suspendAfterDays) {
            company.isSuspended = true;
            await company.save();
            console.log(`Company ${company._id} suspended after ${suspendAfterDays} days`);
        }
    }
};
exports.autoSuspendCompanies = autoSuspendCompanies;
