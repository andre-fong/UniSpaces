import Image from "next/image";
import React, { useEffect, useState } from "react";
import styles from "../styles/Search.module.scss";
import getData from "../utils/getData";
import DropdownMenu from "./DropdownMenu";

export default function Dropdown({ width, height }) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    } else {
      setLoading(true);
      const promise = fetch(`/api/schools?similarTo=${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      promise
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [query]);

  let icon = loading ? (
    <Image src="/loading.gif" width={35} height={35} alt="Loading" />
  ) : (
    <Image src="/magnifyingGlass.png" width={38} height={38} alt="Search" />
  );

  return (
    <div className={styles.container}>
      <div className={styles.input_wrapper}>
        <input
          type="text"
          autoComplete="off"
          className={styles.input}
          id="input"
          placeholder="Search for a university or college here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: width, height: height }}
        />
        {icon}

        <DropdownMenu options={results} query={query} loading={loading} />
      </div>
    </div>
  );
}
