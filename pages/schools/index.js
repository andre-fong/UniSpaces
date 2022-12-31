import React, { useState } from "react";
import Head from "next/head";
import searchStyles from "../../styles/Search.module.scss";
import styles from "../../styles/Schools.module.scss";
import Image from "next/image";
import Link from "next/link";
import SchoolCard from "../../components/SchoolCard";
import { getSchools } from "../api/schools";
import { getSQLData } from "../../utils/sqlQuery";
import PaginationTab from "../../components/PaginationTab";
import { useRouter } from "next/router";

export default function Schools({ schools, error, query, count, page }) {
  // State managing search query
  const [search, setSearch] = useState(query);

  // State managing type of school (U or C)
  const [type, setType] = useState(null);

  // Router for sending user to search schools page
  const router = useRouter();

  // Function to change filter type
  function changeType(str) {
    if (str === type) setType(null);
    else setType(str);
  }

  // Error occurring in getServerSideProps
  if (error) {
    console.error(error);
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Send user to search schools page
    router.push(`/schools?query=${search}`);
  }

  return (
    <>
      <Head>
        <title>Schools | UniSpaces</title>
      </Head>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={searchStyles.input_wrapper}>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                autoComplete="off"
                placeholder="Search for a university or college here..."
                className={searchStyles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <Link href={search ? `/schools?query=${search}` : "/schools"}>
              <Image
                src="/magnifyingGlass.png"
                width={38}
                height={38}
                alt="Search"
              />
            </Link>
          </div>

          <div className={styles.filter}>
            <h2 className={styles.filter_title}>Filter by: </h2>
            <div className={styles.filter_options}>
              <button
                className={styles.filter_button_a}
                onClick={() => {
                  changeType("U");
                }}
                style={{
                  backgroundColor:
                    type === "U" ? "rgb(255, 77, 77)" : "whitesmoke",
                  color: type === "U" ? "white" : "black",
                  fontWeight: type === "U" ? "500" : "normal",
                }}
              >
                University
              </button>
              <button
                className={styles.filter_button_b}
                onClick={() => {
                  changeType("C");
                }}
                style={{
                  backgroundColor:
                    type === "C" ? "rgb(255, 77, 77)" : "whitesmoke",
                  color: type === "C" ? "white" : "black",
                  fontWeight: type === "C" ? "500" : "normal",
                }}
              >
                College
              </button>
            </div>
          </div>
        </div>

        {schools.length > 0 ? (
          <h1 className={styles.results_message}>
            Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, count)} of{" "}
            {count} results {query && `for "${query}"`}
          </h1>
        ) : (
          <h1 className={styles.results_message}>
            Showing 0 results {query && `for "${query}"`}
          </h1>
        )}

        <div className={styles.results}>
          {schools.length > 0 &&
            schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
        </div>

        <PaginationTab
          page={page}
          count={count}
          queryURL={`/schools?query=${query || ""}`}
        />
      </div>
    </>
  );
}

// Request schools from DB
export async function getServerSideProps(context) {
  const query = context.query.query;
  const page = context.query.page || 1;

  if (isNaN(page) || page < 1)
    return { props: { error: "Invalid page number" } };

  // Get all schools from DB, with similarTo query if provided
  const response = await getSchools({
    query: { similarTo: query, offset: (page - 1) * 10 },
  });
  if (response.status !== 200) return { props: { error: response.json } };

  const data = response.json;

  // Get count of all results
  let sql = `SELECT COUNT(*) AS count FROM university`;
  let queries = [];
  if (query) {
    sql += ` WHERE name LIKE ?`;
    queries.push(`%${query}%`);
  }

  const count = await getSQLData(sql, queries);

  return {
    props: {
      schools: data,
      count: count[0].count,
      query: query || "",
      page: parseInt(page) || 1,
    },
  };
}
