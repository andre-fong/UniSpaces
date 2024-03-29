import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/Signin.module.scss";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RoundedButton from "../../components/RoundedButton";
import Head from "next/head";

export default function Signin() {
  const [error, setError] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handles submitting signin form
  function handleSubmit(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((res) => {
        if (res.status !== 201) {
          setError(true);
          setToastOpen(true);
          throw new Error("Failed to sign in");
        }
        setError(false);
        setToastOpen(true);
        console.log("Signed in");
        setTimeout(() => {
          location.href = "/";
        }, 3000);
      })
      .catch((err) => {
        console.warn(err);
      });
  }

  // Handle closing toast message
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  return (
    <>
      <Head>
        <title>Sign in | UniSpaces</title>
      </Head>
      <div className={styles.content}>
        <div className={styles.modal}>
          <Link href="/">
            <div className={styles.logo}>
              <Image
                src="/android-chrome-512x512.png"
                alt="UniSpaces logo"
                width={30}
                height={30}
              />
              <h2 className={styles.unispaces}>UniSpaces</h2>
            </div>
          </Link>
          <h1 className={styles.title}>Sign in</h1>
          <div className={styles.subtitle}>to continue to UniSpaces</div>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            width="100%"
          >
            <FormControl sx={{ m: 2, width: "300px" }} variant="outlined">
              <InputLabel htmlFor="username" error={error}>
                Username
              </InputLabel>
              <OutlinedInput
                id="username"
                name="username"
                type="text"
                error={error}
                placeholder="Username"
                required
                startAdornment={
                  <InputAdornment position="start">
                    <AccountCircleIcon />
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>

            <FormControl sx={{ m: 2, width: "300px" }} variant="outlined">
              <InputLabel htmlFor="password" error={error}>
                Password
              </InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                error={error}
                placeholder="Password"
                required
                startAdornment={
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            <div className={styles.bottom}>
              <Link href="/signup">
                <span className={styles.create_account}>Create an account</span>
              </Link>
              <RoundedButton
                text="Confirm"
                primary="rgb(255, 77, 77)"
                secondary="white"
                submit
              />
            </div>
          </Box>
        </div>

        <Snackbar
          open={toastOpen && error}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert severity="error" onClose={handleClose}>
            That wasn&apos;t in our records. Try again?
          </Alert>
        </Snackbar>

        <Snackbar
          open={toastOpen && error === false}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert severity="success" onClose={handleClose}>
            Successfully signed in! Redirecting you to our homepage...
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}
