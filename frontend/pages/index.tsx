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

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  console.log("[Home] getStaticProps()");
  const rates = await getRates();
  const status = await getLatestStatus();
  return {
    props: { rates, status },
    revalidate: 60 * 60, // 1 hour
  };
};

const Home: NextPage<HomePageProps> = ({ rates, status }) => {
  console.log("[Home] render:", rates);

  const midRateData = rates.find((r) => r.source === "MidRate");
  if (midRateData == null) {
    throw new Error("No midrate found");
  }
  const midRate = midRateData.rate;

  const initSgd = 500;
  const initPhp = initSgd * midRate;
  const [sgdAmount, setSgdAmount] = useState(initSgd.toString());
  const [phpAmount, setPhpAmount] = useState(initPhp.toFixed(2));

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log("newValue", newValue);
    if (/^\d*(\.\d*)?$/.test(newValue)) {
      console.log(`${newValue} is a number`);
      const sgdAmount = newValue ? parseFloat(newValue) : 0;
      const phpAmount = sgdAmount * midRate;
      setSgdAmount(sgdAmount.toString());
      setPhpAmount(phpAmount.toFixed(2));
    } else {
      console.log(`"${newValue}" is NOT a number`);
    }
  };

  const ratesRows = rates.map((rate) => {
    return <RateRow key={rate.id} rateData={rate} />;
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
          <div className="flex justify-center">
            <div>
              SGD:
              <br />
              <input
                type="text"
                maxLength={8}
                value={sgdAmount}
                onChange={handleAmountChange}
              />
            </div>
            <div>
              PHP:
              <br />
              <label>{phpAmount}</label>
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
};

const RateRow = ({ rateData }: RateProps) => {
  console.log("rateData from RateRow", rateData);
  return (
    <tr id={rateData.id}>
      <td>{rateData.source}</td>
      <td>{rateData.rate.toFixed(2)}</td>
      <td>{rateData.fee}</td>
      <td>{0.0}</td>
    </tr>
  );
};

export default Home;
