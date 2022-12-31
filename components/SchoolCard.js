import React from "react";
import styles from "../styles/SchoolCard.module.scss";
import Image from "next/image";
import Link from "next/link";
import { useUserFetching } from "../utils/useUserFetching";

export default function SchoolCard({ school }) {
  const user = useUserFetching(school.created_by_id);

  if (!school) return; // Fix for undefined school

  return (
    <div className={styles.content}>
      <Link href={`/schools/${school.id}`}>
        <div className={styles.inner_content}>
          <div className={styles.picture}>
            <Image
              src={school.img || "/defaultSchool.jpg"}
              alt={school.name}
              fill
            />
          </div>
          <div className={styles.info}>
            <div className={styles.top}>
              <h2 className={styles.name}>{school.name}</h2>
              <p className={styles.description}>
                {school.description || "No description provided"}
              </p>
            </div>
            <div className={styles.bottom}>
              <div className={styles.user}>
                <div className={styles.profile_picture}>
                  <Image
                    src={user?.img ? user.img : "/defaultUser.webp"}
                    alt={
                      user
                        ? `${user.username}'s Profile`
                        : "No profile provided"
                    }
                    fill
                  />
                </div>

                <p className={styles.username}>{user?.username || ""}</p>
              </div>
              <div className={styles.location}></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
