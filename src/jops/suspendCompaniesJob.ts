import cron from "node-cron";
import User from "../models/User";

// المهمة هتشتغل كل يوم الساعة 12 منتصف الليل
export const suspendCompaniesJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running suspendCompaniesJob - checking companies suspension status...");

    const today = new Date();

    try {
      // نجلب كل الشركات اللي مش معلقة حالياً
      const companies = await User.find({
        role: "company",
        isSuspended: false,
      });

      for (const company of companies) {
        if (!company.activatedAt) continue;

        const activatedAt = new Date(company.activatedAt);
        const diffDays = Math.floor((today.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= (company.suspendAfterDays ?? 30)) {
          company.isSuspended = true;
          await company.save();
          console.log(`Company ${company._id} suspended automatically after ${diffDays} days.`);
        }
      }

    } catch (error) {
      console.error("Error running suspendCompaniesJob:", error);
    }
  });
};
