import mongoose from "mongoose";
mongoose.pluralize(null); // Disable auto-pluralization

// Define the schema for progress details
const progressDetailSchema = new mongoose.Schema({
  item: { type: String, required: true },
  itemType: { type: String, default: null }, // e.g., Geo-Bag Type A, B, C
  progressDetailsStart: { type: Date, required: true },
  progressDetailsEnd: { type: Date, required: true },
  previousProgress: { type: Number, required: true, default: 0 },
  currentProgress: { type: Number, required: true, default: 0 },
  totalProgress: { type: Number, required: true, min: 0 },
  physicalProgressPercentage: { type: Number, required: true, min: 0 },
  financialProgressPercentage: { type: Number, required: true, min: 0 },
});

// Define the schema for lots
const lotSchema = new mongoose.Schema({
  lot: { type: String, required: true },
  progressDetails: [progressDetailSchema],
});

// Create virtual fields for each lot's total and previous progress
lotSchema.virtual("totalProgress").get(function () {
  return this.progressDetails.reduce(
    (acc, detail) => acc + detail.totalProgress,
    0
  );
});

lotSchema.virtual("currentProgress").get(function () {
  return this.progressDetails.reduce(
    (acc, detail) => acc + detail.currentProgress,
    0
  );
});

lotSchema.virtual("previousProgress").get(function () {
  if (this.progressDetails.length > 0) {
    return this.progressDetails[this.progressDetails.length - 1].totalProgress;
  }
  return 0; // Default if no progress details
});

// Define the schema for zones
const zoneSchema = new mongoose.Schema({
  zone: { type: String, required: true },
  lots: [lotSchema], // Embed lots within each zone
});

// Define the main schema for goods progress with zones array
const goodsProgressSchema = new mongoose.Schema(
  {
    zones: [zoneSchema], // Embed zones as an array
  },
  {
    collection: "GoodsProgress", // Explicitly set the collection name
  }
);

// Export the GoodsProgress model
export const GoodsProgress = mongoose.model(
  "GoodsProgress",
  goodsProgressSchema
);
