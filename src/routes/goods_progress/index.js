import express from "express";
import {
  getGoodsProgress,
  postGoodsProgress,
  updateGoodsProgress,
  deleteGoodsProgress,
  getGoodsProgressById,
  getProgressAnalytics,
  getProgressByZoneAndLot,
} from "../../controllers/goodsProgressControllers.js";

const router = express.Router();

// GET all goods progress
router.get("/", getGoodsProgress);

// POST new goods progress
router.post("/", postGoodsProgress);

// GET aggregated progress analytics
router.get("/analytics", getProgressAnalytics);

// PUT (Update) goods progress by ID
router.put("/:id", updateGoodsProgress);

// DELETE goods progress by ID
router.delete("/:id", deleteGoodsProgress);

// GET specific goods progress by ID
router.get("/:id", getGoodsProgressById);

// GET progress by zone and lot
router.get("/zone/:zone", getProgressByZoneAndLot);

export default router;
