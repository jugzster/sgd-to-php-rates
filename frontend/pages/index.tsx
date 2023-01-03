import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import React, { FC, useState } from "react";
import { ExchangeRate, getRates } from "../lib/exchangeRate";
import { Status, getLatestStatus } from "../lib/status";
import { GetStaticProps, NextPage } from "next";

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
  const [phpAmount, setPhpAmount] = useState(initSgd * midRate);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log("newValue", newValue);
    if (/^\d*(\.\d*)?$/.test(newValue)) {
      console.log(`${newValue} is a number`);

      setSgdAmountStr(newValue);
      const newSgdAmount = newValue ? parseFloat(newValue) : 0;
      setSgdAmount(newSgdAmount);

      setPhpAmount(newSgdAmount * midRate);
    } else {
      console.log(`"${newValue}" is NOT a number`);
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
        <div className="grid place-items-center">
          <h1 className="text-3xl font-bold underline">SGD to PHP rates</h1>
          <div>
            <p>MARKET RATE: 1 SGD = {midRate} PHP</p>
          </div>
          <div className="flex justify-center">
            <div>
              SGD:
              <br />
              <input
                type="text"
                maxLength={8}
                value={sgdAmountStr}
                onChange={handleAmountChange}
              />
            </div>
            <div>
              PHP:
              <br />
              <label>{phpAmount.toFixed(2)}</label>
            </div>
          </div>
          <div className="p-4">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Rate</th>
                  <th>Fees</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>{ratesRows}</tbody>
            </table>
          </div>
          <div>
            <p className="text-gray-500">
              Last updated on: <span>{status.updated_on.toString()}</span>
            </p>
          </div>
        </div>

        {/*
          Title
          Mid-rate
          Rates table
          Rates history
         */}
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
    <tr id={rateData.id}>
      <td>{rateData.source}</td>
      <td>{exchangeRate.toFixed(2)}</td>
      <td>{fee.toFixed(2)}</td>
      <td>{phpAmount.toFixed(2)}</td>
    </tr>
  );
};

export default Home;
