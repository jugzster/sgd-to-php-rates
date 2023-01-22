import clientPromise from "./mongodb";

export type Status = Readonly<{
  _id: string;
  updatedOn: Date;
}>;

export async function getLatestStatus(): Promise<Status> {
  const client = await clientPromise;
  const db = client.db(process.env.DATABASE_NAME);
  const result = await db.collection("status").findOne(
    {},
    {
      projection: {
        updatedOn: 1,
      },
      sort: { _id: -1 }, // Descending
    }
  );

  const status = JSON.parse(JSON.stringify(result));
  return status;
}
