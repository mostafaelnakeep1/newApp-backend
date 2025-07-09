"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// addUser.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("./models/User"));
dotenv_1.default.config();
const createUser = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI || "");
        const existingUser = await User_1.default.findOne({ email: "elnakeebm34@gmail.com" });
        if (existingUser) {
            console.log("⚠️ User already exists. Skipping creation.");
            return mongoose_1.default.disconnect();
        }
        const hashedPassword = await bcryptjs_1.default.hash("123456", 10);
        const user = new User_1.default({
            name: "Admin",
            email: "elnakeebm34@gmail.com",
            password: hashedPassword,
            role: "admin",
        });
        await user.save();
        console.log("✅ User created successfully");
    }
    catch (err) {
        console.error("❌ Failed to create user", err);
    }
    finally {
        mongoose_1.default.disconnect();
    }
};
createUser();
