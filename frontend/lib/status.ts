import fetchJson from "./api";

export type Status = Readonly<{
  id: string;
  status: string;
  updated_on: Date;
  errors: string[];
}>;

export async function getLatestStatus(): Promise<Status> {
  const url = "http://127.0.0.1:8000/status";
  return await fetchJson(url);
}
