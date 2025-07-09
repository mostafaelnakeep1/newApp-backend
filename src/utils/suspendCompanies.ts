// utils/suspendCompanies.ts
import User from "../models/User";
import mongoose from "mongoose";

export const autoSuspendCompanies = async () => {
  const now = new Date();

  const companies = await User.find({ role: "company", isSuspended: false });

  for (const company of companies) {
    const { activatedAt, suspendAfterDays } = company;
    const diffInDays =
      (now.getTime() - new Date(activatedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays >= suspendAfterDays) {
      company.isSuspended = true;
      await company.save();
      console.log(`Company ${company._id} suspended after ${suspendAfterDays} days`);
    }
  }
};
