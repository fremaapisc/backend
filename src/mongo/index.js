import mongoose from "mongoose";
const uri =
  "mongodb+srv://fremaapisc:Fremaa%402025@fremaa.zbxwrsl.mongodb.net/?retryWrites=true&w=majority&appName=piscFremaa";

mongoose.set('strictQuery', true);

export async function dbConnect() {
  try {
    await mongoose.connect(uri, {
      dbName: "piscFremaa",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: "admin",
      user: "fremaapisc",
      pass: "Fremaa@2025",
      // Optional Mongoose connection options
    });
    console.log("Connected to MongoDB Atlas using Mongoose!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

dbConnect();