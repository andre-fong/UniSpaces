import React from "react";
import Link from "next/link";
import styles from "../styles/Menu.module.scss";

export default function DropdownMenu({ options, query, loading }) {
  if (!query || loading) {
    return;
  }

  const optionsJSX =
    options.length > 0 ? (
      options.map((option) => {
        return (
          <Link key={option.uni_id} href={`/universities/${option.uni_id}`}>
            <div className={styles.option}>
              <div className={styles.option_name}>{option.name}</div>
            </div>
          </Link>
        );
      })
    ) : (
      <div className={styles.no_results}>No results could be found.</div>
    );

  return <div className={styles.container}>{optionsJSX}</div>;
}
