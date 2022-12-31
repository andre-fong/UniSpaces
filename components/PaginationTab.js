import React from "react";
import Image from "next/image";
import styles from "../styles/PaginationTab.module.scss";
import Link from "next/link";
import { generatePageList } from "../utils/generatePageList";

export default function PaginationTab({ page, count, queryURL }) {
  // No need for page count, all results are shown on one page
  if (count <= 10) return null;

  const maxPage = Math.ceil(count / 10);

  const pageList = [];
  for (let i = 1; i <= maxPage; i++) {
    pageList.push(i);
  }

  const pages = generatePageList(pageList, page);

  const previousTab =
    page > 1 ? (
      <Link href={`${queryURL}&page=${+page - 1}`}>
        <div className={styles.previous}>
          <Image
            src="/chevron-left.svg"
            alt="Previous page"
            width={15}
            height={20}
          />
          <span>Previous</span>
        </div>
      </Link>
    ) : (
      <div className={`${styles.previous} ${styles.disabled}`} aria-disabled>
        <Image
          src="/chevron-left.svg"
          alt="Previous page"
          width={15}
          height={20}
        />
        <span>Previous</span>
      </div>
    );

  const nextTab =
    page < maxPage ? (
      <Link href={`${queryURL}&page=${+page + 1}`}>
        <div className={styles.next}>
          <span>Next</span>
          <Image
            src="/chevron-right.svg"
            alt="Next page"
            width={15}
            height={20}
          />
        </div>
      </Link>
    ) : (
      <div className={`${styles.next} ${styles.disabled}`} aria-disabled>
        <span>Next</span>
        <Image
          src="/chevron-right.svg"
          alt="Next page"
          width={15}
          height={20}
        />
      </div>
    );

  return (
    <div className={styles.container} role="navigation">
      <div className={styles.inner_container}>
        {previousTab}

        {/* Map transformed pages array to page buttons */}
        {pages.map((p) =>
          p === "..." ? (
            <div
              key={p}
              className={`${styles.page} ${styles.disabled} ${styles.ellipsis}`}
              aria-disabled
            >
              {p}
            </div>
          ) : p !== parseInt(page) ? (
            <Link key={p} href={`${queryURL}&page=${p}`}>
              <div className={styles.page}>{p}</div>
            </Link>
          ) : (
            <div
              key={p}
              className={`${styles.page} ${styles.disabled} ${styles.active}`}
              aria-disabled
            >
              {p}
            </div>
          )
        )}

        {nextTab}
      </div>
    </div>
  );
}
