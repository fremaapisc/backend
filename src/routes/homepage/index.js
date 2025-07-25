import express from "express";
import { getHomepageProgress } from "../../controllers/homePageProgress.js";

const router = express.Router();

// GET all goods progress
router.get("/", getHomepageProgress);

export default router;
