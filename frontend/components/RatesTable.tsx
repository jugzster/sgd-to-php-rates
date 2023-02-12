import { ExchangeRate } from "../lib/exchangeRate";
import RateRow from "./RateRow";

type RatesTableProps = {
  rates: ExchangeRate[];
  sgdAmount: number;
};

const RatesTable = ({ rates, sgdAmount }: RatesTableProps) => {
  // Sort by best rate
  const sortedrates = [...rates].sort((a, b) => {
    if (a.rate > b.rate) {
      return -1;
    }
    if (a.rate < b.rate) {
      return 1;
    }
    return 0;
  });

  const ratesRows = sortedrates
    .filter((rate) => rate.source !== "MidRate")
    .map((rate) => {
      return <RateRow key={rate._id} rateData={rate} amount={sgdAmount} />;
    });

  return (
    <div className="flex justify-center mt-4 mb-8">
      <table className="table-fixed text-left shadow-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-100">
            <th className="pl-4 py-2">Send with</th>
            <th className="px-4">Rate</th>
            <th className="px-4">Fees</th>
            <th className="px-4 w-40">You get</th>
          </tr>
        </thead>
        <tbody>{ratesRows}</tbody>
      </table>
    </div>
  );
};

export default RatesTable;
