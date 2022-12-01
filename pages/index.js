import React from "react";
import Head from "next/head";
import styles from "../styles/Home.module.scss";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | UniSpaces</title>
      </Head>
      <div className={styles.content}></div>
    </>
  );
}
