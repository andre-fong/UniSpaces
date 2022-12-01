import Image from "next/image";
import Link from "next/link";
import RoundedButton from "./RoundedButton";
import styles from "../styles/Navbar.module.scss";

export default function Navbar() {
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
    </nav>
  );
}
