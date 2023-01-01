import fetchJson from "./api";

export type ExchangeRate = Readonly<{
  id: string;
  source: string;
  rate: number;
  fee: number;
  effective_on: Date;
  updated_on: Date;
}>;

export async function getRates(): Promise<ExchangeRate[]> {
  const url = "http://127.0.0.1:8000/rates";
  return await fetchJson(url);
}
