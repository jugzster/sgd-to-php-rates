import Head from "next/head";
import { Inter } from "@next/font/google";
import React, { useState } from "react";
import { GetStaticProps, NextPage } from "next";
import { ExchangeRate, getRates } from "../lib/exchangeRate";
import { Status, getLatestStatus } from "../lib/status";
import { amountFormatter } from "../lib/formatter";
import Input from "./Input";
import Footer from "./Footer";

type HomePageProps = {
  rates: ExchangeRate[];
  status: Status;
};

const inter = Inter({ subsets: ["latin"] });

const MID_RATE_TAG = "MidRate";

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  console.log("[Home] getStaticProps()");
  const rates = await getRates();
  const status = await getLatestStatus();
  return {
    props: { rates, status },
    revalidate: parseInt(process.env.REVALIDATE_SECONDS!),
  };
};

const Home: NextPage<HomePageProps> = ({ rates, status }) => {
  console.log("[Home] render:", rates);

  const midRateData = rates.find((r) => r.source === MID_RATE_TAG);
  if (midRateData == null) {
    throw new Error("No midrate found");
  }
  const midRate = midRateData.rate;

  const initSgd = 500;
  const [sgdAmountStr, setSgdAmountStr] = useState(initSgd.toString());
  const [sgdAmount, setSgdAmount] = useState(initSgd);

  const initPhp = initSgd * midRate;
  const [phpAmountStr, setPhpAmountStr] = useState(initPhp.toString());

  const handleSgdAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    console.log("New SGD value", newValue);
    if (/^\d*(\.\d*)?$/.test(newValue)) {
      setSgdAmountStr(newValue);

      const newSgdAmount = newValue ? parseFloat(newValue) : 0;
      setSgdAmount(newSgdAmount);

      const newPhpAmount = newSgdAmount * midRate;
      setPhpAmountStr(amountFormatter.format(newPhpAmount));
    }
  };

  const handlePhpAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    console.log("New PHP value", newValue);
    if (/^\d*(\.\d*)?$/.test(newValue)) {
      setPhpAmountStr(newValue);

      const newPhpAmount = newValue ? parseFloat(newValue) : 0;
      const newSgdAmount = newPhpAmount / midRate;
      setSgdAmount(newSgdAmount);
      setSgdAmountStr(amountFormatter.format(newSgdAmount));
    }
  };

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
    .filter((rate) => rate.source !== MID_RATE_TAG)
    .map((rate) => {
      return <RateRow key={rate.id} rateData={rate} amount={sgdAmount} />;
    });

  return (
    <>
      <Head>
        <title>SGD to PHP Rates</title>
        <meta
          name="description"
          content="Get SGD to PHP rates from remittance centers"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container mx-auto pt-4 px-4">
          <header>
            <menu>
              <div className="flex justify-between">
                <span>Say Hello</span>
                <span>Dark Mode</span>
              </div>
            </menu>
            <div className="text-center text-3xl mt-4">
              <h1 className="font-bold underline">SGD to PHP Rates</h1>
            </div>
          </header>
          <div className="text-center font-semibold my-8 h-16">
            <p className="text-slate-400">MARKET RATE: 1 SGD =</p>
            <p className="text-xl hover:text-2xl font-bold duration-200">
              {midRate} Philippine Pesos
            </p>
          </div>
          {/* TODO Change to grid */}
          <div className="flex justify-center">
            <div className="px-4">
              <p>SGD</p>
              <Input value={sgdAmountStr} onChange={handleSgdAmountChange} />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <div className="px-4">
              <p>PHP</p>
              <Input value={phpAmountStr} onChange={handlePhpAmountChange} />
            </div>
          </div>
          <div className="flex justify-center mt-12 mb-12 overflow-auto relative">
            <table className="table-fixed text-left shadow-sm">
              <thead className="uppercase">
                <tr className="text-left bg-slate-400">
                  <th className="px-6">Source</th>
                  <th className="px-6">Rate</th>
                  <th className="px-6">Fees</th>
                  <th className="px-6">Amount</th>
                </tr>
              </thead>
              <tbody>{ratesRows}</tbody>
            </table>
          </div>
          <Footer status={status} />
        </div>
      </main>
    </>
  );
};

type RateProps = {
  rateData: ExchangeRate;
  amount: number;
};

const RateRow = ({ rateData, amount }: RateProps) => {
  console.log("rateData from RateRow", rateData);
  const exchangeRate = rateData.rate;
  const fee = rateData.fee;
  const phpAmount = amount !== 0 ? exchangeRate * (amount - fee) : 0;
  return (
    <tr id={rateData.id} className="even:bg-slate-200">
      <td className="px-6">{rateData.source}</td>
      <td className="px-6">{exchangeRate.toFixed(2)}</td>
      <td className="px-6">{fee.toFixed(2)}</td>
      <td className="px-6">{amountFormatter.format(phpAmount)} PHP</td>
    </tr>
  );
};

export default Home;
