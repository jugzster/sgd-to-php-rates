import React from "react";
import { ExchangeRate } from "../lib/exchangeRate";
import { amountFormatter } from "../lib/formatter";

type RateProps = {
  rateData: ExchangeRate;
  amount: number;
};

const getLink = (source: string): string => {
  const src = source.toLowerCase();
  switch (source.toLowerCase()) {
    case "wise":
      return "https://wise.com/gb/currency-converter/sgd-to-php-rate";
    case "iremit":
      return "https://iremitx.com";
    case "iremit walk-in":
      return "https://www.facebook.com/iremitsg/";
    case "metroremit":
      return "https://sg.metroremit.com";
    case "kabayan":
      return "https://www.kabayan.sg";
    case "steadfast":
      return "https://www.steadfastmoneytransfer.com";
    case "dbs":
      return "https://www.dbs.com.sg";
    default:
      return "notfound";
  }
};

const RateRow = ({ rateData, amount }: RateProps) => {
  const exchangeRate = rateData.rate;
  const fee = rateData.fee;
  const phpAmount =
    amount !== 0 && amount - fee > 0 ? exchangeRate * (amount - fee) : 0;

  return (
    <tr id={rateData.id} className="even:bg-gray-200 dark:even:bg-gray-800">
      <td className="pl-4 py-2">
        <a
          href={getLink(rateData.source)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          {rateData.source}
        </a>
      </td>
      <td className="px-4">{exchangeRate.toFixed(2)}</td>
      <td className="px-4">${fee.toFixed(2)}</td>
      <td className="px-4">₱{amountFormatter.format(phpAmount)}</td>
    </tr>
  );
};

export default RateRow;
