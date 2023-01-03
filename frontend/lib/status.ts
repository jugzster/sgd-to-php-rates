import fetchJson from "./api";

const API_URL = process.env.API_URL;

export type Status = Readonly<{
  id: string;
  status: string;
  updated_on: Date;
  errors: string[];
}>;

export async function getLatestStatus(): Promise<Status> {
  const url = `${API_URL}/status`;
  return await fetchJson(url);
}
