// addUser.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User";

dotenv.config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");

    const existingUser = await User.findOne({ email: "elnakeebm34@gmail.com" });
    if (existingUser) {
      console.log("⚠️ User already exists. Skipping creation.");
      return mongoose.disconnect();
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = new User({
      name: "Admin",
      email: "elnakeebm34@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await user.save();
    console.log("✅ User created successfully");
  } catch (err) {
    console.error("❌ Failed to create user", err);
  } finally {
    mongoose.disconnect();
  }
};

createUser();
