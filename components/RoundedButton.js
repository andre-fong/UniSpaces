import React from "react";
import styles from "../styles/Button.module.scss";

/**
 *
 * @param {String} text Button text
 * @param {Number} padding Button padding
 * @param {String} primary Primary color
 * @param {String} secondary Secondary color
 * @param {String} link Relative link
 */
export default function RoundedButton({ text, padding, primary, secondary }) {
  return (
    <button
      className={styles.RoundedBtn}
      style={{
        padding: padding,
        backgroundColor: primary,
        color: secondary,
        border: `1.2px solid ${secondary}`,
      }}
    >
      {text}
    </button>
  );
}
