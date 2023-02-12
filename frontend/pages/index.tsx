import Head from "next/head";
import React, { useState } from "react";
import { GetStaticProps, NextPage } from "next";
import { ExchangeRate, getRates } from "../lib/exchangeRate";
import { Status, getLatestStatus } from "../lib/status";
import { amountFormatter } from "../lib/formatter";
import Header from "../components/Header";
import Input from "../components/Input";
import Footer from "../components/Footer";
import MidRate from "../components/MidRate";
import RatesTable from "../components/RatesTable";
import LastUpdated from "../components/LastUpdated";

type HomePageProps = {
  rates: ExchangeRate[];
  status: Status;
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const rates = await getRates();
  const status = await getLatestStatus();
  return {
    props: { rates, status },
    revalidate: parseInt(process.env.REVALIDATE_SECONDS!),
  };
};

const Home: NextPage<HomePageProps> = ({ rates, status }) => {
  const midRateData = rates.find((r) => r.source === "MidRate");
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

  return (
    <>
      <Head>
        <title>SGD/PHP Rates</title>
        <meta
          name="description"
          content="Get SGD to PHP rates from remittance centers"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/peso.png" />
      </Head>
      <div className="flex flex-col items-center min-w-full min-h-screen mx-auto pt-4 px-4 dark:bg-gray-900 dark:text-gray-100">
        <Header />
        <MidRate midRate={midRate} />
        <div className="flex justify-center">
          <div className="flex flex-col items-center md:flex-row space-y-2 md:space-y-0">
            <div className="px-4 md:my-0">
              <p>SGD</p>
              <Input
                value={sgdAmountStr}
                maxLength={8}
                onChange={handleSgdAmountChange}
              />
            </div>
            <div className="mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="md:rotate-90 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
            </div>
            <div className="px-4 md:my-0">
              <p>PHP</p>
              <Input
                value={phpAmountStr}
                maxLength={9}
                onChange={handlePhpAmountChange}
              />
            </div>
          </div>
        </div>
        <LastUpdated status={status} />
        <RatesTable rates={rates} sgdAmount={sgdAmount} />
        <Footer />
      </div>
    </>
  );
};

export default Home;
