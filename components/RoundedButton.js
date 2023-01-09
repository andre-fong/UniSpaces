import React from "react";
import styles from "../styles/Button.module.scss";

/**
 * @param {String} text Button text
 * @param {Number} padding Button padding
 * @param {String} primary Primary color
 * @param {String} secondary Secondary color
 * @param {Boolean} submit Submit button for forms
 */
export default function RoundedButton({
  text,
  padding,
  primary,
  secondary,
  submit,
}) {
  return (
    <button
      className={styles.RoundedBtn}
      style={{
        padding: padding,
        backgroundColor: primary,
        color: secondary,
        border: `1.2px solid ${secondary}`,
      }}
      type={submit ? "submit" : "button"}
    >
      {text}
    </button>
  );
}
