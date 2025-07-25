import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Serve static files from the "src/landing" directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Display Index.html - which in the landing page of the dashboard
router.get("*", (req, res) => {
  console.log("Received a request to the root route");
  console.log("FremaaPisc__dirname :", __dirname);
  res.sendFile(path.join(__dirname, "../../landing/index.html"));
});

export default router;
