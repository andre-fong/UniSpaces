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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RoundedButton from "../../components/RoundedButton";

export default function Signin() {
  const router = useRouter();

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
        if (res.status !== 201) throw new Error("Failed to sign in");
        console.log("Signed in");
      })
      .catch((err) => {
        console.warn(err);
      });
  }

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
            <InputLabel htmlFor="username">Username</InputLabel>
            <OutlinedInput
              id="username"
              name="username"
              type="text"
              startAdornment={
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>

          <FormControl sx={{ m: 2, width: "300px" }} variant="outlined">
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
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
              <span className={styles.create_account}>Create account</span>
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
    </div>
  );
}
