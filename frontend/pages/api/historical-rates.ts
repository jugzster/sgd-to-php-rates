import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

type HistoricalRate = {
  date: Date;
  rate: number;
};

const VALID_RANGES = ["1W", "1M", "3M", "6M", "1Y", "2Y", "All"] as const;
type Range = (typeof VALID_RANGES)[number];

const RANGE_DAYS: Record<Range, number | null> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "2Y": 730,
  All: null,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const range = (req.query.range as string) || "1Y";

  if (!VALID_RANGES.includes(range as Range)) {
    return res.status(400).json({
      error: `Invalid range. Must be one of: ${VALID_RANGES.join(", ")}`,
    });
  }

  const client = await clientPromise;
  const db = client.db(process.env.DATABASE_NAME);
  const collection = db.collection("historicalRates");

  const days = RANGE_DAYS[range as Range];
  const matchStage: Record<string, unknown> = { source: "MidRate" };
  if (days !== null) {
    matchStage.effectiveOn = {
      $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    };
  }

  let results: HistoricalRate[];

  if (["1Y", "2Y", "All"].includes(range)) {
    // Aggregate to daily: latest MidRate per SGT day
    const pipeline = [
      { $match: matchStage },
      { $sort: { effectiveOn: 1 } },
      {
        $addFields: {
          sgtDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$effectiveOn",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $group: {
          _id: "$sgtDate",
          rate: { $last: "$rate" },
          effectiveOn: { $last: "$effectiveOn" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$effectiveOn",
          rate: { $toDouble: "$rate" },
        },
      },
      { $sort: { date: 1 } },
    ];
    results = (await collection.aggregate(pipeline).toArray()) as HistoricalRate[];
  } else {
    // All 12h snapshots
    const docs = await collection
      .find(matchStage, {
        projection: { _id: 0, rate: { $toDouble: "$rate" }, effectiveOn: 1 },
      })
      .sort({ effectiveOn: 1 })
      .toArray();

    results = docs.map((doc) => ({
      date: doc.effectiveOn,
      rate: doc.rate,
    }));
  }

  res.status(200).json(results);
}
