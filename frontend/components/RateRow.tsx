import React from "react";
import { ExchangeRate } from "../lib/exchangeRate";
import { amountFormatter } from "../lib/formatter";

type RateProps = {
  rateData: ExchangeRate;
  amount: number;
};

const RateRow = ({ rateData, amount }: RateProps) => {
  const exchangeRate = rateData.rate;
  const fee = rateData.fee;
  const phpAmount = amount !== 0 ? exchangeRate * (amount - fee) : 0;

  return (
    <tr id={rateData.id} className="hover:bg-stone-100 even:bg-slate-200">
      <td className="pl-6">{rateData.source}</td>
      <td className="px-6">{exchangeRate.toFixed(2)}</td>
      <td className="px-6">{fee.toFixed(2)}</td>
      <td className="px-4">{amountFormatter.format(phpAmount)} PHP</td>
    </tr>
  );
};

export default RateRow;
