"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("✅ productRoutes loaded");
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validate_1 = require("../middlewares/validate");
const productValidation_1 = require("../validation/productValidation");
const productController_1 = require("../controllers/productController");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
// استدعاء منتجات الشركة (بدون حماية أو مع حماية الشركة حسب تطبيقك)
router.get("/", productController_1.getProducts);
router.get("/public", productController_1.getPublicProducts);
router.get("/all", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), productController_1.getAllProducts);
router.post("/", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["company"]), (0, validate_1.validateBody)(productValidation_1.createProductSchema), productController_1.createProduct);
router.patch("/:productId/toggle-suspension", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), productController_1.toggleProductSuspension);
router.patch("/:productId/toggle-visibility", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["admin"]), productController_1.toggleProductVisibility);
router.put("/:id", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["company"]), productController_1.updateProduct);
router.delete("/:productId", authMiddleware_1.protect, (0, roleMiddleware_1.authorize)(["company", "admin"]), productController_1.deleteProduct);
exports.default = router;
