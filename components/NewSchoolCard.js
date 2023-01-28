import React from "react";
import styles from "../styles/NewCard.module.scss";
import Link from "next/link";
import { useUser } from "../utils/useUser";
import AddIcon from "@mui/icons-material/Add";

export default function NewSchoolCard() {
  const { user, loading } = useUser();
  const isSignedIn = !loading && user?.user_id;

  const card = (
    <div className={styles.content}>
      <div className={styles.icons}>
        <AddIcon fontSize="inherit" />
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>Add a school</h1>
      </div>
    </div>
  );

  return isSignedIn ? <Link href={"schools/new"}>{card}</Link> : card;
}
