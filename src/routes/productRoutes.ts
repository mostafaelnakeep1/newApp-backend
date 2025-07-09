console.log("✅ productRoutes loaded");

import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validate";
import { createProductSchema  } from "../validation/productValidation";
import { 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct,
  getAllProducts,
  toggleProductSuspension,
  toggleProductVisibility,
  getPublicProducts
  } from "../controllers/productController";
import { authorize } from "../middlewares/roleMiddleware";



const router = express.Router();

// استدعاء منتجات الشركة (بدون حماية أو مع حماية الشركة حسب تطبيقك)
router.get("/", getProducts);
router.get("/public", getPublicProducts);
router.get("/all", protect, authorize(["admin"]), getAllProducts);

router.post("/", protect, authorize(["company"]), validateBody(createProductSchema), createProduct);

router.patch("/:productId/toggle-suspension", protect, authorize(["admin"]), toggleProductSuspension);

router.patch("/:productId/toggle-visibility", protect, authorize(["admin"]), toggleProductVisibility);

router.put("/:id", protect, authorize(["company"]), updateProduct);

router.delete("/:productId", protect, authorize(["company", "admin"]), deleteProduct);



export default router;
