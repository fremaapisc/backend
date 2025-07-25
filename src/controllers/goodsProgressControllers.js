import { GoodsProgress } from "../mongoSchemas/goodsProgress.schema.js";

// Remove ensureCollectionExists since Mongoose handles collection creation automatically

// Get all goods progress
export const getGoodsProgress = async (req, res) => {
  console.log("Fetching Data From GoodsProgress Collection...");
  try {
    const goodsProgress = await GoodsProgress.find();
    res.json(goodsProgress);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goods progress", error });
    console.log("Fetch Error from MongoDB...");
  }
};

// Post new goods progress
export const postGoodsProgress = async (req, res) => {
  try {
    const { zones } = req.body; // Destructure zones from request body for validation

    console.log(
      "POSTING ...... GoodsProgress data........",
      JSON.stringify(req.body, null, 2)
    );

    // Validate the input payload
    if (!Array.isArray(zones) || zones.length === 0) {
      return res.status(400).json({ message: "Zones data is required." });
    }

    // Validate zones, lots, and progressDetails
    zones.forEach((zone) => {
      if (!zone.zone || !Array.isArray(zone.lots) || zone.lots.length === 0) {
        throw new Error("Each zone must have a valid name and lots.");
      }

      zone.lots.forEach((lot) => {
        if (
          !lot.lot ||
          !Array.isArray(lot.progressDetails) ||
          lot.progressDetails.length === 0
        ) {
          throw new Error(
            "Each lot must have a valid name and progress details."
          );
        }

        // Validate progressDetails fields
        lot.progressDetails.forEach((detail) => {
          if (
            !detail.item ||
            !detail.progressDetailsStart ||
            !detail.progressDetailsEnd
          ) {
            throw new Error(
              "Each progress detail must have a valid item, start date, and end date."
            );
          }
          // Convert dates to ISO 8601 string format
          //console.log("Date from Application: ", detail.progressDetailsStart);
          detail.progressDetailsStart = new Date(
            detail.progressDetailsStart
          ).toISOString();
          detail.progressDetailsEnd = new Date(
            detail.progressDetailsEnd
          ).toISOString();
          //console.log("Date After Conversion: ", detail.progressDetailsStart);
        });
      });
    });

    // Create a new GoodsProgress document with the entire payload
    const newGoodsProgress = new GoodsProgress(req.body);

    // Save the document to the database
    await newGoodsProgress.save();

    res.status(201).json(newGoodsProgress);
  } catch (error) {
    console.error("Error saving goods progress:", error.message);
    res.status(500).json({ message: "Error saving goods progress", error });
  }
};

// Post new goods progress
/* export const postGoodsProgress = async (req, res) => {
  try {
    const { zones } = req.body; // Extract zones from request body

    console.log(
      "POSTING ...... GoodsProgress data........",
      JSON.stringify(zones, null, 2)
    );

    // Validate zones
    if (!Array.isArray(zones) || zones.length === 0) {
      return res.status(400).json({ message: "Zones data is required." });
    }

    // Process and format zones and lots
    const formattedZones = zones.map((zone) => {
      const { zone: zoneName, lots } = zone;

      if (!zoneName || !Array.isArray(lots) || lots.length === 0) {
        throw new Error("Each zone must have a valid name and lots.");
      }

      // Process lots within the zone
      const formattedLots = lots.map((lot) => {
        const { lot: lotName, progressDetails } = lot;

        if (
          !lotName ||
          !Array.isArray(progressDetails) ||
          progressDetails.length === 0
        ) {
          throw new Error(
            "Each lot must have a valid name and progress details."
          );
        }

        // Format progress details for each lot
        const formattedProgressDetails = progressDetails.map((detail) => {
          const previousProgressValue = parseInt(detail.previousProgress) || 0;
          const currentProgressValue = parseInt(detail.currentProgress) || 0;
          const totalProgress = previousProgressValue + currentProgressValue;

          return {
            item: detail.item,
            itemType: detail.itemType || null,
            progressDetailsStart: detail.progressDetailsStart,
            progressDetailsEnd: detail.progressDetailsEnd,
            previousProgress: previousProgressValue,
            currentProgress: currentProgressValue,
            totalProgress,
            physicalProgressPercentage: parseFloat(
              detail.physicalProgressPercentage || 0
            ).toFixed(2),
            financialProgressPercentage: parseFloat(
              detail.financialProgressPercentage || 0
            ).toFixed(2),
          };
        });

        return {
          lot: lotName,
          progressDetails: formattedProgressDetails,
        };
      });

      return { zone: zoneName, lots: formattedLots };
    });

    // Create a new GoodsProgress document
    const newGoodsProgress = new GoodsProgress({ zones: formattedZones });

    // Save the document to the database
    await newGoodsProgress.save();

    // Respond with the newly created document
    res.status(201).json(newGoodsProgress);
  } catch (error) {
    console.error("Error saving goods progress:", error.message);
    res.status(500).json({ message: "Error saving goods progress", error });
  }
};
 */
/* export const postGoodsProgress = async (req, res) => {
  try {
    //const { zones, ...restData } = req.body;
    const { zones } = req.body;

    console.log(
      "POSTING ...... GoodsProgress data........",
      JSON.stringify(zones, null, 2)
    );

    if (!Array.isArray(zones) || zones.length === 0) {
      return res.status(400).json({ message: "Zones data is required." });
    }

    // Validate and process zones and lots
    const formattedZones = zones.map((zone) => {
      const { zone: zoneName, lots } = zone;
      console.log("Formatted Zones:", JSON.stringify(formattedZones, null, 2));

      if (!zoneName || !Array.isArray(lots) || lots.length === 0) {
        throw new Error("Each zone must have a valid name and lots.");
      }

      const formattedLots = lots.map((lot) => {
        const { lot: lotName, progressDetails } = lot;

        if (
          !lotName ||
          !Array.isArray(progressDetails) ||
          progressDetails.length === 0
        ) {
          throw new Error(
            "Each lot must have a valid name and progress details."
          );
        }

        // Compute previous progress from the last progress detail
        const lastDetail = progressDetails[progressDetails.length - 1];
        const previousProgress = lastDetail ? lastDetail.totalProgress : 0;

        return {
          lot: lotName,
          progressDetails: progressDetails.map((detail) => ({
            item: detail.item,
            itemType: detail.itemType || null,
            progressDetailsStart: detail.progressDetailsStart,
            progressDetailsEnd: detail.progressDetailsEnd,
            previousProgress: detail.previousProgress || 0,
            currentProgress: detail.currentProgress || 0,
            totalProgress: detail.totalProgress || 0,
            physicalProgressPercentage: detail.physicalProgressPercentage || 0,
            financialProgressPercentage:
              detail.financialProgressPercentage || 0,
          })),
          previousProgress,
        };
      });

      return { zone: zoneName, lots: formattedLots };
    });

    const newGoodsProgress = new GoodsProgress({ zones: formattedZones });
    if (!formattedZones || formattedZones.length === 0) {
      throw new Error("Zones data is required.");
    }

    await newGoodsProgress.save();
    res.status(201).json(newGoodsProgress);
  } catch (error) {
    console.error("Error saving goods progress:", error.message);
    res.status(500).json({ message: "Error saving goods progress", error });
  }
}; */

// Update goods progress by ID
export const updateGoodsProgress = async (req, res) => {
  try {
    const goodsProgress = await GoodsProgress.findById(req.params.id);
    if (!goodsProgress) {
      return res.status(404).json({ message: "Goods Progress not found" });
    }

    const { progressDetails, ...restData } = req.body;

    const lastDetail =
      goodsProgress.progressDetails[goodsProgress.progressDetails.length - 1];
    const previousProgress = lastDetail
      ? lastDetail.totalProgress
      : goodsProgress.previousProgress;

    const updatedGoodsProgress = await GoodsProgress.findByIdAndUpdate(
      req.params.id,
      { ...restData, previousProgress, progressDetails },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedGoodsProgress);
  } catch (error) {
    res.status(500).json({ message: "Error updating goods progress", error });
  }
};

// Aggregated Progress by Zone, Lot, and Items
/* export const getProgressAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Ensure proper date parsing and validation
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required." });
  }

  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  try {
    const result = await GoodsProgress.aggregate([
      { $unwind: "$zones" }, // Unwind zones
      { $unwind: "$zones.lots" }, // Unwind lots within each zone
      { $unwind: "$zones.lots.progressDetails" }, // Unwind progress details

      // Match progress details that fall between the given date range
      {
        $match: {
          "zones.lots.progressDetails.progressDetailsEnd": {
            $gte: new Date(startDate).toISOString(),
            $lte: new Date(endDate).toISOString(),
          },
        },
      },

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
              progressDetailsStart:
                "$zones.lots.progressDetails.progressDetailsStart",
              progressDetailsEnd:
                "$zones.lots.progressDetails.progressDetailsEnd",
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
            $avg: "$lastlPhysicalProgress", // Calculate average progress across the zone
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
      "Analytics Data GoodsProgress ........",
      JSON.stringify(result, null, 2)
    );

    res.json(result);
  } catch (error) {
    console.error("Error during aggregation:", error);
    res.status(500).json({ error: "Server error during aggregation" });
  }
}; */

/* export const getProgressAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Ensure proper date parsing and validation
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required." });
  }

  console.log("Analytics Start Date:", startDate);
  console.log("Analytics End Date:", endDate);

  try {
    const result = await GoodsProgress.aggregate([
      { $unwind: "$zones" }, // Unwind zones
      { $unwind: "$zones.lots" }, // Unwind lots within each zone
      { $unwind: "$zones.lots.progressDetails" }, // Unwind progress details

      // Match progress details that fall between the given date range
      {
        $match: {
          "zones.lots.progressDetails.progressDetailsEnd": {
            $gte: new Date(startDate).toISOString(),
            $lte: new Date(endDate).toISOString(),
          },
        },
      },

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
              progressDetailsStart:
                "$zones.lots.progressDetails.progressDetailsStart",
              progressDetailsEnd:
                "$zones.lots.progressDetails.progressDetailsEnd",
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
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
                {
                  $divide: [
                    {
                      $ifNull: [
                        "$zones.lots.progressDetails.financialProgressPercentage",
                        0,
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
          lastGeoBagsSupplied: {
            $sum: {
              $cond: [
                {
                  $eq: ["$zones.lots.progressDetails.item", "Geo-Textile Bags"],
                },
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
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
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
                0,
              ],
            },
          },
          lastSewingThreadSupplied: {
            $sum: {
              $cond: [
                {
                  $eq: ["$zones.lots.progressDetails.item", "Sewing Threads"],
                },
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
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
          lotPhysicalProgress: { $avg: "$lastPhysicalProgress" },
          lotFinancialProgress: { $avg: "$lastFinancialProgress" },
          lotFinancialUtilization: { $sum: "$lastFinancialUtilization" },
          lotGeoBagsSupplied: { $sum: "$lastGeoBagsSupplied" },
          lotFabricSupplied: { $sum: "$lastFabricSupplied" },
          lotSewingThreadSupplied: { $sum: "$lastSewingThreadSupplied" },
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
          zonePhysicalProgress: { $avg: "$totalPhysicalProgress" },
          zoneFinancialProgress: { $avg: "$totalFinancialProgress" },
          totalFinancialUtilization: { $sum: "$lotFinancialUtilization" },
          totalGeoBagsSupplied: { $sum: "$lotGeoBagsSupplied" },
          totalFabricSupplied: { $sum: "$lotFabricSupplied" },
          totalSewingThreadSupplied: { $sum: "$lotSewingThreadSupplied" },
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getProgressAnalytics:", error);
    res
      .status(500)
      .json({ error: "Error fetching progress analytics", details: error });
  }
};
 */

export const getProgressAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required." });
  }

  try {
    const result = await GoodsProgress.aggregate([
      { $unwind: { path: "$zones", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$zones.lots", preserveNullAndEmptyArrays: true } },
      {
        $unwind: {
          path: "$zones.lots.progressDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          "zones.lots.progressDetails.progressDetailsEnd": {
            $cond: [
              {
                $eq: [
                  { $type: "$zones.lots.progressDetails.progressDetailsEnd" },
                  "string",
                ],
              },
              { $toDate: "$zones.lots.progressDetails.progressDetailsEnd" },
              "$zones.lots.progressDetails.progressDetailsEnd",
            ],
          },
          "zones.lots.progressDetails.progressDetailsStart": {
            $cond: [
              {
                $eq: [
                  { $type: "$zones.lots.progressDetails.progressDetailsStart" },
                  "string",
                ],
              },
              { $toDate: "$zones.lots.progressDetails.progressDetailsStart" },
              "$zones.lots.progressDetails.progressDetailsStart",
            ],
          },
        },
      },

      // Match progress details that fall between the given date range
      {
        $match: {
          "zones.lots.progressDetails.progressDetailsEnd": {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      /* {
        $match: {
          "zones.lots.progressDetails.progressDetailsEnd": {
            $gte: new Date(startDate).toISOString(),
            $lte: new Date(endDate).toISOString(),
          },
        },
      }, */

      // Group by zone, lot, and item to accumulate progress details
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
              progressDetailsStart:
                "$zones.lots.progressDetails.progressDetailsStart",
              progressDetailsEnd:
                "$zones.lots.progressDetails.progressDetailsEnd",
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
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
                {
                  $divide: [
                    {
                      $ifNull: [
                        "$zones.lots.progressDetails.financialProgressPercentage",
                        0,
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
          lastGeoBagsSupplied: {
            $sum: {
              $cond: [
                {
                  $eq: ["$zones.lots.progressDetails.item", "Geo-Textile Bags"],
                },
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
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
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
                0,
              ],
            },
          },
          lastSewingThreadSupplied: {
            $sum: {
              $cond: [
                {
                  $eq: ["$zones.lots.progressDetails.item", "Sewing Threads"],
                },
                { $ifNull: ["$zones.lots.progressDetails.totalProgress", 0] },
                0,
              ],
            },
          },
        },
      },

      // Group by zone and lot to aggregate data
      {
        $group: {
          _id: {
            zone: "$_id.zone",
            lot: "$_id.lot",
          },
          progressDetails: {
            $push: "$progressDetails",
          },
          totalPhysicalProgress: { $avg: "$lastPhysicalProgress" },
          totalFinancialProgress: { $avg: "$lastFinancialProgress" },
          lotFinancialUtilization: { $sum: "$lastFinancialUtilization" },
          lotGeoBagsSupplied: { $sum: "$lastGeoBagsSupplied" },
          lotFabricSupplied: { $sum: "$lastFabricSupplied" },
          lotSewingThreadSupplied: { $sum: "$lastSewingThreadSupplied" },
        },
      },

      // Group by zone to calculate overall progress
      {
        $group: {
          _id: "$_id.zone",
          lots: {
            $push: {
              lot: "$_id.lot",
              progressDetails: "$progressDetails",
              totalPhysicalProgress: "$totalPhysicalProgress",
              totalFinancialProgress: "$totalFinancialProgress",
            },
          },
          zonePhysicalProgress: { $avg: "$totalPhysicalProgress" },
          zoneFinancialProgress: { $avg: "$totalFinancialProgress" },
          totalFinancialUtilization: { $sum: "$lotFinancialUtilization" },
          totalGeoBagsSupplied: { $sum: "$lotGeoBagsSupplied" },
          totalFabricSupplied: { $sum: "$lotFabricSupplied" },
          totalSewingThreadSupplied: { $sum: "$lotSewingThreadSupplied" },
        },
      },
    ]);

    console.log("ZONES DATA .................START...");
    console.log("ZONES DATA .................END...");

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getProgressAnalytics:", error);
    res
      .status(500)
      .json({ error: "Error fetching progress analytics", details: error });
  }
};

// Get goods progress by ID
export const getGoodsProgressById = async (req, res) => {
  try {
    const goodsProgress = await GoodsProgress.findById(req.params.id);
    if (!goodsProgress) {
      return res.status(404).json({ message: "Goods Progress not found" });
    }
    res.status(200).json(goodsProgress);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goods progress", error });
  }
};

// Delete goods progress by ID
export const deleteGoodsProgress = async (req, res) => {
  try {
    const deletedGoodsProgress = await GoodsProgress.findByIdAndDelete(
      req.params.id
    );
    if (!deletedGoodsProgress) {
      return res.status(404).json({ message: "Goods Progress not found" });
    }
    res.status(200).json({ message: "Goods Progress deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goods progress", error });
  }
};

// Get progress by Zone and Lot
export const getProgressByZoneAndLot = async (req, res) => {
  const { zone } = req.params;
  try {
    const result = await GoodsProgress.aggregate([
      { $match: { zone } },
      { $unwind: "$lots.progressDetails" },
      {
        $group: {
          _id: "$lots.lot",
          totalPhysicalProgress: {
            $sum: "$lots.progressDetails.physicalProgressPercentage",
          },
          totalFinancialProgress: {
            $sum: "$lots.progressDetails.financialProgressPercentage",
          },
        },
      },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error during aggregation" });
  }
};
