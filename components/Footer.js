import React from "react";
import RoundedButton from "./RoundedButton";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.Footer}>
      <div className={styles.unispaces}>
        <h3 className={styles.header}>ABOUT UNISPACES</h3>
        <div className={styles.desc}>
          <p>
            UniSpaces is a passion project that features the hottest landmarks
            of top universities and colleges across Canada.
          </p>
          <p>Created with Next.js, MySQL, and React.</p>
        </div>
        <Link href="/about">
          <RoundedButton
            text="Read more"
            primary="rgb(255, 77, 77)"
            secondary="white"
          />
        </Link>
        {/* <a
          href="https://github.com/andre-fong/UniSpaces"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "underline",
            display: "block",
            marginTop: "15px",
          }}
        >
          Made with ❤️ on GitHub!
        </a> */}
      </div>

      <div className={styles.navigation}>
        <h3 className={styles.header}>NAVIGATION</h3>
        <div className={styles.links}>
          <Link href="/schools">
            <p>Schools</p>
          </Link>
          <Link href="/spaces">
            <p>Spaces</p>
          </Link>
          <Link href="/signup">
            <p>Create an account</p>
          </Link>
          <Link href="/signin">
            <p>Sign in to an existing account</p>
          </Link>
        </div>
      </div>

      <div className={styles.me}>
        <h3 className={styles.header}>ABOUT ME</h3>
        <div className={styles.intro}>
          <div
            style={{
              borderRadius: "100px",
              width: "70px",
              minWidth: "70px",
              height: "70px",
              overflow: "hidden",
            }}
            className={styles.pfp}
          >
            <Image
              src="/andre_fong.jpg"
              alt="Andre Fong"
              width={70}
              height={70}
            />
          </div>
          <p style={{ margin: "0" }}>
            Hey, I&apos;m Andre! I&apos;m a starving UofT CS student by day and
            full stack web developer by night. Check out more of my projects on
            my
            <span style={{ cursor: "not-allowed" }}>
              {" "}
              personal website (WIP)
            </span>
          </p>
        </div>

        <p style={{ marginTop: "10px" }}>Connect with me:</p>

        <div className={styles.socials}>
          {/* Linkedin */}
          <a
            href="https://www.linkedin.com/in/andre-fong"
            target="_blank"
            rel="noreferrer"
            className={styles.social_link}
          >
            <Image
              src="/LinkedinLogo.png"
              alt="Linkedin"
              width={42}
              height={42}
            />
          </a>
          {/* GitHub */}
          <a
            href="https://github.com/andre-fong/UniSpaces"
            target="_blank"
            rel="noreferrer"
            className={styles.social_link}
          >
            <Image src="/GitHubLogo.png" alt="GitHub" width={40} height={40} />
          </a>
          {/* Email */}
          <a
            href="mailto:business@andrefong.com"
            className={styles.social_link}
          >
            <Image src="/EmailLogo.jpg" alt="Email" width={40} height={40} />
          </a>
        </div>
      </div>
    </footer>
  );
}
