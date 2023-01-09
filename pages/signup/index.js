import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/Signin.module.scss";
import { useRouter } from "next/router";
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RoundedButton from "../../components/RoundedButton";

export default function Signup() {
  const router = useRouter();

  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handles submitting signup form
  async function handleSubmit(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username.length > 40) {
      setUsernameError(
        "Oops, that didn't work! Try checking your username again?"
      );
      setPasswordError(null);
      setToastOpen(true);
      return;
    }
    if (password.length < 6 || password.length > 50) {
      setPasswordError(true);
      setUsernameError(null);
      setToastOpen(true);
      return;
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const json = await response.json();
    const { code } = json;

    if (code !== 201) {
      if (code === 409) {
        setUsernameError(
          "Oops, that username was already taken. Try another one?"
        );
        setToastOpen(true);
      } else {
        setGeneralError(true);
        setToastOpen(true);
      }
      return;
    }

    // Successful signup
    setUsernameError(null);
    setPasswordError(null);
    setGeneralError(null);
    setToastOpen(true);

    // Redirect to home page after 3 seconds
    setTimeout(() => {
      router.push("/signin");
    }, 3000);
  }

  // Handle closing toast message
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  return (
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
        <h1 className={styles.title}>Sign up</h1>
        <div className={styles.subtitle}>to start using UniSpaces</div>

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
            <InputLabel htmlFor="username" error={usernameError !== null}>
              Username
            </InputLabel>
            <OutlinedInput
              id="username"
              name="username"
              type="text"
              error={usernameError !== null}
              placeholder="Username"
              required
              startAdornment={
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              }
              label="Password"
            />
            <FormHelperText error={usernameError != null} required>
              1-40 characters long
            </FormHelperText>
          </FormControl>

          <FormControl sx={{ m: 2, width: "300px" }} variant="outlined">
            <InputLabel htmlFor="password" error={passwordError}>
              Password
            </InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              error={passwordError}
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
            <FormHelperText error={passwordError} required>
              6-50 characters long
            </FormHelperText>
          </FormControl>
          <div className={styles.bottom}>
            <Link href="/signin">
              <span className={styles.create_account}>
                I already have an account
              </span>
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
        open={toastOpen && usernameError !== null}
        autoHideDuration={7000}
        onClose={handleClose}
      >
        <Alert severity="error" onClose={handleClose}>
          {usernameError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={toastOpen && passwordError}
        autoHideDuration={7000}
        onClose={handleClose}
      >
        <Alert severity="error" onClose={handleClose}>
          Oops, that didn&apos;t work. Try checking your password again?
        </Alert>
      </Snackbar>

      <Snackbar
        open={toastOpen && !usernameError && !passwordError}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert severity="success" onClose={handleClose}>
          Success! Redirecting to sign in page...
        </Alert>
      </Snackbar>

      <Snackbar
        open={toastOpen && generalError}
        autoHideDuration={7000}
        onClose={handleClose}
      >
        <Alert severity="error" onClose={handleClose}>
          Oops, something went wrong. Try again later?
        </Alert>
      </Snackbar>
    </div>
  );
}
