import Image from "next/image";
import Link from "next/link";
import RoundedButton from "./RoundedButton";
import styles from "../styles/Navbar.module.scss";
import { useUser } from "../utils/useUser";
import { useState, useRef } from "react";
import { useClickedOutside } from "../utils/useClickedOutside";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";

export default function Navbar() {
  const { user, loading, error } = useUser();

  const [isExpanded, setIsExpanded] = useState(false);

  // Wrapper ref for dropdown menu
  const wrapperRef = useRef(null);
  useClickedOutside(wrapperRef, handleExpand);

  const router = useRouter();

  function handleExpand() {
    setIsExpanded((prev) => !prev);
  }

  // Signout of current session
  function handleSignOut() {
    // Delete cookie on DB
    fetch("/api/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        // Delete cookie on client and reload page
        deleteCookie("sessionId");
        router.reload();
      });
  }

  if (error) console.error(error);

  const right = loading ? null : user.code !== 404 ? (
    <div className={styles.right}>
      <div className={styles.profile}>
        <button
          onClick={() => {
            setTimeout(() => {
              if (!isExpanded) handleExpand();
            }, 50);
          }}
          className={styles.button_reset}
        >
          <Image
            src={user.img || "/defaultUser.webp"}
            alt={`${user.username}'s profile`}
            width={36}
            height={36}
          />
        </button>

        {isExpanded && (
          <div className={styles.menu_dropdown} aria-hidden={!isExpanded}>
            <div className={styles.up_triangle}></div>
            <div className={styles.menu} ref={wrapperRef}>
              <h4 className={styles.welcome}>Welcome, {user.username}!</h4>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className={`${styles.signout} ${styles.button_reset}`}
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className={styles.userBtns}>
      <Link href="/signin">
        <span style={{ color: "white" }}>Sign in</span>
      </Link>

      <Link href="/signup">
        <RoundedButton
          text="Sign up"
          primary="rgb(255, 77, 77)"
          secondary="white"
        />
      </Link>
    </div>
  );

  return (
    <nav className={styles.Navbar}>
      <Link href="/">
        <div className={styles.logo}>
          <Image
            src="/android-chrome-512x512.png"
            alt="UniSpaces logo"
            width={30}
            height={30}
          />
          <span className={styles.unispaces}>UniSpaces</span>
        </div>
      </Link>

      {right}
    </nav>
  );
}
