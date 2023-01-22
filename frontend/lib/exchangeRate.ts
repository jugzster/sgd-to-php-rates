import clientPromise from "./mongodb";

export type ExchangeRate = Readonly<{
  _id: string;
  source: string;
  rate: number;
  fee: number;
  effectiveOn: Date;
  updatedOn: Date;
}>;

export async function getRates(): Promise<ExchangeRate[]> {
  const client = await clientPromise;
  const db = client.db(process.env.DATABASE_NAME);
  const results = await db
    .collection("latestRates")
    .find<ExchangeRate>(
      {},
      {
        projection: {
          source: 1,
          rate: { $toDouble: "$rate" },
          fee: 1,
        },
      }
    )
    .toArray();

  const rates = JSON.parse(JSON.stringify(results));
  return rates;
}
