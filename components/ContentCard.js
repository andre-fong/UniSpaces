import React from "react";
import styles from "../styles/ContentCard.module.scss";

export default function ContentCard({ children, style }) {
  return (
    <div className={styles.content} style={style}>
      {children}
    </div>
  );
}
