import Image from "next/image";
import React, { useEffect, useState } from "react";
import styles from "../styles/Search.module.scss";
import getData from "../utils/getData";
import DropdownMenu from "./DropdownMenu";

export default function Dropdown({ width, height }) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);

  // useEffect(() => {
  //   const promise = getData(`/api/university?name=${query}`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include",
  //   });

  //   promise
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data);
  //       setLoading(false);
  //       setResults(data);
  //     });
  // }, [query]);

  let icon = loading ? (
    <Image src="/loading.gif" width={35} height={35} alt="Loading" />
  ) : (
    <Image src="/magnifyingGlass.png" width={38} height={38} alt="Search" />
  );

  function handleChange(e) {
    setLoading(true);
    setQuery(e.target.value);
  }

  return (
    <div className={styles.container}>
      <div className={styles.input_wrapper}>
        <input
          type="text"
          autoComplete="none"
          className={styles.input}
          id="input"
          placeholder="Search for a university or college here..."
          value={query}
          onChange={handleChange}
          style={{ width: width, height: height }}
        />
        {icon}

        <DropdownMenu options={results} query={query} loading={loading} />
      </div>
    </div>
  );
}
