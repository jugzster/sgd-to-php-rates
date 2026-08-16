export type HistoricalRate = {
  date: Date;
  rate: number;
};

export async function fetchHistoricalRates(
  range: string
): Promise<HistoricalRate[]> {
  const response = await fetch(`/api/historical-rates?range=${range}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return await response.json();
}
