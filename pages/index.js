import React from "react";
import Head from "next/head";
import SearchDropdown from "../components/SearchDropdown";
import styles from "../styles/Home.module.scss";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | UniSpaces</title>
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uni-spaces.vercel.app/" />
        <meta
          property="og:title"
          content="UniSpaces - Explore the hotspots of Canada's top Universities and Colleges"
        />
        <meta
          property="og:description"
          content="UniSpaces is a platform that allows students to explore the hotspots of Canada's top Universities and Colleges."
        />
        <meta
          property="og:image"
          content="https://uni-spaces.vercel.app/unispacesBanner.jpg"
        />
      </Head>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Explore the <span className={styles.gradient_text}>hotspots</span> of
          <br />
          Canada&apos;s top Universities and Colleges.
        </h1>

        <div style={{ marginTop: "45px", marginBottom: "80px" }}>
          <SearchDropdown width={500} />
        </div>
      </div>
    </>
  );
}
