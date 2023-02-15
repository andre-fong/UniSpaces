import React from "react";
import styles from "../styles/SpacePreview.module.scss";
import Image from "next/image";

export default function SpacePreview({ space }) {
  if (space === "more")
    return (
      <div className={styles.content}>
        <div className={styles.view_more}>Click to view more...</div>
      </div>
    );

  return (
    <div className={styles.content}>
      <Image
        src={space.img || "/defaultSpace.jpg"}
        alt={space.name}
        width={80}
        height={100}
      />
      <div className={styles.info}>
        <h3 className={styles.name}>{space.name}</h3>
        <p style={{ fontWeight: "bold" }}>...</p>
      </div>
    </div>
  );
}
