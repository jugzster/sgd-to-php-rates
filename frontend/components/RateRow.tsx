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
  const phpAmount =
    amount !== 0 && amount - fee > 0 ? exchangeRate * (amount - fee) : 0;

  return (
    <tr id={rateData.id} className="even:bg-gray-200 dark:even:bg-gray-800">
      <td className="pl-4 py-2">{rateData.source}</td>
      <td className="px-4">{exchangeRate.toFixed(2)}</td>
      <td className="px-4">${fee.toFixed(2)}</td>
      <td className="px-4">₱{amountFormatter.format(phpAmount)}</td>
    </tr>
  );
};

export default RateRow;
