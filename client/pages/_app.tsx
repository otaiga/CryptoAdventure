import React from "react";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import Head from "next/head";
import "antd/dist/antd.css";
import "../styles/globals.css";

const APP_ID = process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

const isServerInfo = Boolean(APP_ID && SERVER_URL);

function MyApp({ Component, pageProps }: AppProps) {
  if (APP_ID === undefined || SERVER_URL === undefined) {
    throw Error("APP_ID and SERVER_URL required!");
  }
  return (
    <>
      <Head>
        <title>Crypto Adventure</title>
        <meta name="description" content="Crypto Adventure" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
        <Component {...pageProps} isServerInfo={isServerInfo} />
      </MoralisProvider>
    </>
  );
}

export default MyApp;
