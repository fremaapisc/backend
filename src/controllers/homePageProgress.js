import { GoodsProgress } from "../mongoSchemas/goodsProgress.schema.js";

// Homepage Progress Data API
export const getHomepageProgress = async (req, res) => {
  try {
    const result = await GoodsProgress.aggregate([
      { $unwind: "$zones" }, // Unwind zones
      { $unwind: "$zones.lots" }, // Unwind lots within each zone
      { $unwind: "$zones.lots.progressDetails" }, // Unwind progress details

      // Group by zone, lot, and item to accumulate the latest progress details
      {
        $group: {
          _id: {
            zone: "$zones.zone",
            lot: "$zones.lots.lot",
            item: "$zones.lots.progressDetails.item",
          },
          progressDetails: {
            $last: {
              item: "$zones.lots.progressDetails.item",
              totalProgress: "$zones.lots.progressDetails.totalProgress",
              physicalProgressPercentage:
                "$zones.lots.progressDetails.physicalProgressPercentage",
              financialProgressPercentage:
                "$zones.lots.progressDetails.financialProgressPercentage",
            },
          },
          lastPhysicalProgress: {
            $last: "$zones.lots.progressDetails.physicalProgressPercentage",
          },
          lastFinancialProgress: {
            $last: "$zones.lots.progressDetails.financialProgressPercentage",
          },
          lastQuantitySupplied: {
            $last: "$zones.lots.progressDetails.totalProgress",
          },
          lastFinancialUtilization: {
            $sum: {
              $multiply: [
                "$zones.lots.progressDetails.totalProgress",
                "$zones.lots.progressDetails.financialProgressPercentage",
              ],
            },
          },
          lastGeoBagsSupplied: {
            $sum: {
              $cond: [
                {
                  $eq: ["$zones.lots.progressDetails.item", "Geo-Textile Bags"],
                },
                "$zones.lots.progressDetails.totalProgress",
                0,
              ],
            },
          },
          lastFabricSupplied: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$zones.lots.progressDetails.item",
                    "Geo-Textile Fabric",
                  ],
                },
                "$zones.lots.progressDetails.totalProgress",
                0,
              ],
            },
          },
          lastSewingThreadSupplied: {
            $sum: {
              $cond: [
                { $eq: ["$zones.lots.progressDetails.item", "Sewing Threads"] },
                "$zones.lots.progressDetails.totalProgress",
                0,
              ],
            },
          },
        },
      },

      // Group by zone and lot to collect all items within the lot
      {
        $group: {
          _id: {
            zone: "$_id.zone",
            lot: "$_id.lot",
          },
          progressDetails: {
            $push: "$progressDetails", // Accumulate progress details
          },
          totalPhysicalProgress: { $avg: "$lastPhysicalProgress" },
          totalFinancialProgress: { $avg: "$lastFinancialProgress" },
          lotPhysicalProgress: {
            $avg: "$lastPhysicalProgress", // Calculate average progress across the zone
          },
          lotFinancialProgress: {
            $avg: "$lastFinancialProgress", // Calculate average progress across the zone
          },
          lotFinancialUtilization: {
            $sum: "$lastFinancialUtilization",
          },
          lotGeoBagsSupplied: {
            $sum: "$lastGeoBagsSupplied",
          },
          lotFabricSupplied: {
            $sum: "$lastFabricSupplied",
          },
          lotSewingThreadSupplied: {
            $sum: "$lastSewingThreadSupplied",
          },
        },
      },

      // Group by zone to get lots and calculate overall zone progress
      {
        $group: {
          _id: "$_id.zone",
          lots: {
            $push: {
              lot: "$_id.lot",
              totalPhysicalProgress: "$lotPhysicalProgress",
              totalFinancialProgress: "$lotFinancialProgress",
              progressDetails: "$progressDetails",
            },
          },
          zonePhysicalProgress: {
            $avg: "$totalPhysicalProgress", // Calculate average progress across the zone
          },
          zoneFinancialProgress: {
            $avg: "$totalFinancialProgress", // Calculate average progress across the zone
          },
          totalFinancialUtilization: {
            $sum: "$lotFinancialUtilization",
          },
          totalGeoBagsSupplied: {
            $sum: "$lotGeoBagsSupplied",
          },
          totalFabricSupplied: {
            $sum: "$lotFabricSupplied",
          },
          totalSewingThreadSupplied: {
            $sum: "$lotSewingThreadSupplied",
          },
        },
      },

      // Sort the zones if needed (e.g., by physical progress)
      {
        $sort: { zonePhysicalProgress: -1 },
      },
    ]);

    console.log(
      "Homepage Data GoodsProgress ........",
      JSON.stringify(result, null, 2)
    );

    res.json(result);
  } catch (error) {
    console.error("Error during aggregation:", error);
    res.status(500).json({ error: "Server error during aggregation" });
  }
};
