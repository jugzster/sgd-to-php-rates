import Head from "next/head";
import React, { useState } from "react";
import { GetStaticProps, NextPage } from "next";
import { ExchangeRate, getRates } from "../lib/exchangeRate";
import { Status, getLatestStatus } from "../lib/status";
import { amountFormatter } from "../lib/formatter";
import Input from "../components/Input";
import Footer from "../components/Footer";
import RateRow from "../components/RateRow";

type HomePageProps = {
  rates: ExchangeRate[];
  status: Status;
};

const MID_RATE_TAG = "MidRate";

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const rates = await getRates();
  const status = await getLatestStatus();
  return {
    props: { rates, status },
    revalidate: parseInt(process.env.REVALIDATE_SECONDS!),
  };
};

const Home: NextPage<HomePageProps> = ({ rates, status }) => {
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
          <div className="text-center font-semibold my-8 h-14">
            <p className="text-slate-400">MARKET RATE: 1 SGD =</p>
            <p className="text-xl hover:text-2xl font-bold duration-200">
              {midRate} Philippine Pesos
            </p>
          </div>
          {/* TODO Change to grid */}
          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row">
              <div className="px-4 mb-2 md:my-0">
                <p>SGD</p>
                <Input value={sgdAmountStr} onChange={handleSgdAmountChange} />
              </div>
              <div className="mx-auto self-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="md:rotate-90 w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                  />
                </svg>
              </div>
              <div className="px-4 mt-2 md:my-0">
                <p>PHP</p>
                <Input value={phpAmountStr} onChange={handlePhpAmountChange} />
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-12 mb-12 overflow-auto relative">
            <table className="table-fixed text-left shadow-sm">
              <thead>
                <tr className="uppercase text-left bg-slate-400">
                  <th className="pl-6">Source</th>
                  <th className="px-4">Rate</th>
                  <th className="px-4">Fees</th>
                  <th className="px-4 w-40">Amount</th>
                </tr>
              </thead>
              <tbody>{ratesRows}</tbody>
            </table>
          </div>
          <div>
            <Footer status={status} />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
