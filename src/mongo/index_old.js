import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/* export const dbConnect = () => {
  mongoose.connection.once("open", () => console.log("DB connection"));
  return mongoose.connect(
    `mongodb+srv://${process.env.DB_LINK}?retryWrites=true&w=majority`,
    { keepAlive: true }
  );
}; */

export const dbConnect = () => {
  mongoose.connection.on("error", (err) => {
    console.error("Database Connection Error:", err);
  });

  mongoose.connection.once("open", () =>
    console.log("DB Connection Established")
  );

  return mongoose.connect(process.env.DB_LINK, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
