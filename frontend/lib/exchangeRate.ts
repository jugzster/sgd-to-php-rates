import fetchJson from "./api";

const API_URL = process.env.API_URL;

export type ExchangeRate = Readonly<{
  id: string;
  source: string;
  rate: number;
  fee: number;
  effective_on: Date;
  updated_on: Date;
}>;

export async function getRates(): Promise<ExchangeRate[]> {
  const url = `${API_URL}/rates`;
  return await fetchJson(url);
}
