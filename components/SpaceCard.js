import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Card.module.scss";
import { useUserFetching } from "../utils/useUserFetching";
import { useTags } from "../utils/useTags";
import Tag from "./Tag";

export default function SpaceCard({ space }) {
  const tags = useTags(space.id);
  const user = useUserFetching(space.created_by_id);

  return (
    <div className={styles.content}>
      <Link href={`/space/${space.id}`}>
        <div className={styles.inner_content}>
          <div className={styles.picture}>
            <Image
              src={space.img || "/defaultSpace.jpg"}
              alt={space.name}
              priority
              fill
              sizes="250px"
            />
          </div>
          <div className={styles.info}>
            <div className={styles.top}>
              <h2 className={styles.name}>{space.name}</h2>
              <div className={styles.tags}>
                {tags && tags.map((tag) => <Tag key={tag.id} tag={tag} />)}
              </div>
              <p className={styles.description}>
                {space.description || "No description provided"}
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
                    width={30}
                    height={30}
                  />
                </div>

                <p className={styles.username}>{user?.username || ""}</p>
              </div>
              <div className={styles.likes}>
                <Image
                  src="/thumbs-up.svg"
                  alt="Like button"
                  width={20}
                  height={20}
                />
                {space.likes}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
