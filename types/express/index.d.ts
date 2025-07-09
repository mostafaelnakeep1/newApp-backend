import { IUser } from "../../src/models/User";
export {}; // ⬅️ مهم علشان يعتبر الملف module وما يشتكيش

declare global {
  namespace Express {
    interface Request {
    user?: IUser; // تقدر تغير any لاحقًا لنوع اليوزر اللي عندك
    
    }
  }
}
