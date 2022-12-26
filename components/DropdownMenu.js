import React from "react";
import Link from "next/link";
import styles from "../styles/Menu.module.scss";

export default function DropdownMenu({ options, query, loading }) {
  if (!query || query.length < 2) {
    return;
  }

  const optionsJSX = options.map((option) => {
    return (
      <Link
        key={option.id}
        href={`/schools/${option.id}`}
        className={styles.link}
      >
        <div className={styles.option}>
          <div className={styles.option_name}>{option.name}</div>
          <div className={styles.option_location}>
            {option.city}, {option.province}
          </div>
        </div>
      </Link>
    );
  });

  return (
    <div className={styles.container}>
      {optionsJSX}
      <div className={styles.result_count}>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <span>
            {options.length === 10 ? `${options.length}+` : options.length}{" "}
            {options.length !== 1 ? "results." : "result."}{" "}
            <Link href="/schools/new">
              <span className={styles.add_link}>Add one</span>
            </Link>{" "}
            if it{"'"}s not here.
          </span>
        )}
      </div>
    </div>
  );
}
