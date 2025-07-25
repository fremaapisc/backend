import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import "./passport.js";


// Routes Import
import { meRoutes, authRoutes, piscRoutes } from "./routes/index.js";
import getGoodsprogressRoutes from "./routes/goods_progress/index.js";
//import { getGoodsProgress, postGoodsProgress } from "./controllers/goodsProgressControllers.js";

import * as fs from "fs";
import cron from "node-cron";
import ReseedAction from "./mongo/ReseedAction.js";

/* Postgres Connection Details Start: */
import pkg from "pg"; // Import entire package
import { dbConnect } from "./mongo/index.js";
const { Pool } = pkg; // Destructure Pool from the package
/* Postgres Connection Details Ends: */

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

/* Postgres Connection Details Start: */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DH_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
/* Postgres Connection Details Ends: */

const whitelist = [process.env.APP_URL_CLIENT];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// MongoDB Connection is commented since data from mongoDB is not
// in use as of now. Once required need to connect multiple DBs
dbConnect();

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

//app.use(bodyParser.json({ type: "application/vnd.api+json", strict: false }));

// Serve static files from the "src/landing" directory
//const __dirname = path.resolve();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("SRC INDEX __dirname :", __dirname);

// Use express.static to serve any static files such as CSS/JS/images
app.use(express.static(path.join(__dirname, "src/landing")));

// API routes
app.use("/goodsprogress", getGoodsprogressRoutes); // CRUD API for Goods Progress
app.use("/", authRoutes);
app.use("/me", meRoutes);
app.use("/", piscRoutes);

// Serve React's index.html for all other routes
app.get("*", function (req, res) {
  console.log("Received Request to Root Route");
  res.sendFile(path.join(__dirname, "/landing/index.html"));
});

// Scheduling cron job if SCHEDULE_HOUR is set in the environment
if (process.env.SCHEDULE_HOUR) {
  cron.schedule(`0 */${process.env.SCHEDULE_HOUR} * * *'`, () => {
    ReseedAction();
  });
}

/* const addUser = async (user) => {
  const { name, email, password, profileImage } = user;
  const query = `
    INSERT INTO users (name, email, password, profile_image, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      name,
      email,
      password,
      profileImage,
    ]);
    console.log("User Added:", result.rows[0]);
  } catch (error) {
    console.error("Error adding user:", error);
  } finally {
    // Closing the pool connection.
    pool.end();
  }
};

// Test the addUser function
addUser({
  name: "Krishna Kamal",
  email: "abc001@haskoningindia.co.in",
  password: "KrishnaKamal",
  profileImage: "../images/creator.jpg",
}); */

app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
