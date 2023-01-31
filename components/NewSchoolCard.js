import React, { useState } from "react";
import styles from "../styles/NewCard.module.scss";
import Link from "next/link";
import { useUser } from "../utils/useUser";
import AddIcon from "@mui/icons-material/Add";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/router";

export default function NewSchoolCard() {
  const router = useRouter();

  const { user, loading } = useUser();
  const isSignedIn = !loading && user?.user_id;

  const [notLogged, setNotLogged] = useState(false);

  function handleClick() {
    if (isSignedIn) {
      router.push("/schools/new");
    } else {
      setNotLogged(true);
    }
  }

  function handleClose(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setNotLogged(false);
  }

  const signinButton = (
    <Link href="/signin">
      <span style={{ fontFamily: "inherit", textDecoration: "underline" }}>
        Sign in
      </span>
    </Link>
  );

  return (
    <>
      <div className={styles.content} onClick={handleClick}>
        <div className={styles.icons}>
          <AddIcon fontSize="inherit" />
        </div>
        <div className={styles.header}>
          <h1 className={styles.title}>Add a school</h1>
        </div>
      </div>

      <Snackbar open={notLogged} autoHideDuration={5000} onClose={handleClose}>
        <Alert severity="error" onClose={handleClose}>
          Oops! You must be signed in to continue. {signinButton}
        </Alert>
      </Snackbar>
    </>
  );
}
