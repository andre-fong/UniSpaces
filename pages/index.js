import React from "react";
import Head from "next/head";
import SearchDropdown from "../components/SearchDropdown";
import styles from "../styles/Home.module.scss";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | UniSpaces</title>
      </Head>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Explore the <span className={styles.gradient_text}>hotspots</span> of
          <br />
          Canada&apos;s top Universities and Colleges
        </h1>

        <div style={{ marginTop: "40px", marginBottom: "80px" }}>
          <SearchDropdown width={500} />
        </div>
      </div>
    </>
  );
}
