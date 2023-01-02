import React from "react";
import styles from "../styles/Tag.module.scss";

export default function Tag({ tag }) {
  return (
    <div
      className={styles.content}
      style={{
        backgroundColor: tag.color || "rgb(0, 0, 84)",
      }}
    >
      <div className={styles.name}>{tag.name}</div>
    </div>
  );
}
