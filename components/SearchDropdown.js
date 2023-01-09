import Image from "next/image";
import React, { useEffect, useState } from "react";
import styles from "../styles/Search.module.scss";
import Link from "next/link";
import DropdownMenu from "./DropdownMenu";
import { useRouter } from "next/router";

export default function Dropdown({ width, height }) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Router for sending user to search schools page
  const router = useRouter();

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

  function handleSubmit(e) {
    e.preventDefault();

    // Send user to search schools page
    router.push(query ? `/schools?query=${query}` : "/schools");
  }

  return (
    <div className={styles.container}>
      <div className={styles.input_wrapper}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            autoComplete="off"
            className={styles.input}
            placeholder="Search for a university or college here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: width, height: height }}
          />
        </form>
        <Link href={query ? `/schools?query=${query}` : "/schools"}>
          <Image
            src="/magnifyingGlass.png"
            width={38}
            height={38}
            alt="Search"
          />
        </Link>

        <DropdownMenu options={results} query={query} loading={loading} />
      </div>
    </div>
  );
}
