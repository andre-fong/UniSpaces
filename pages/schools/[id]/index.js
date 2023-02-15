import React, { useState } from "react";
import { getSQLData } from "../../../utils/sqlQuery";
import { getSchoolById } from "../../api/schools/[schoolId]";
import { getSpaces } from "../../api/spaces";
import styles from "../../../styles/SchoolPage.module.scss";
import Head from "next/head";
import Image from "next/image";
import ContentCard from "../../../components/ContentCard";
import DescriptionIcon from "@mui/icons-material/Description";
import ExploreIcon from "@mui/icons-material/Explore";
import Skeleton from "@mui/material/Skeleton";
import { useUserFetching } from "../../../utils/useUserFetching";
import Link from "next/link";
import SpacePreview from "../../../components/SpacePreview";

export default function SchoolSpaces({ school, spaces }) {
  const { user, loading: userLoading } = useUserFetching(school.created_by_id);

  return (
    <>
      <Head>
        <title>{`${school.name} | UniSpaces`}</title>
      </Head>
      <div className={styles.content}>
        <div className={styles.banner}>
          <Image
            src={school.img || "/defaultSchoolBanner.jpg"}
            alt="Default school banner"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
          <div className={styles.title}>
            <h1 className={styles.name}>{school.name}</h1>
            <div className={styles.location}>
              <Image
                src="/location-dot.svg"
                alt="Location pin"
                height={25}
                width={25}
                style={{ filter: "invert(100%)" }}
              />
              <a
                href={`https://www.google.com/maps/place/${school.city},+${school.province}/`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}
              >
                {`${school.city}, ${school.province}`}
              </a>
            </div>
          </div>
        </div>
        <main className={styles.info_main}>
          <ContentCard style={{ marginBottom: 20 }}>
            <div className={styles.info_card}>
              <Link href={`/schools/${school.id}/spaces`}>
                <div className={styles.info_header}>
                  <ExploreIcon sx={{ fontSize: "2.5em" }} />
                  <h2 className={styles.info_title}>Spaces</h2>
                </div>
                <div style={{ overflow: "auto" }}>
                  {spaces.length > 0 ? (
                    <div className={styles.spaces_scrollable}>
                      {spaces.map((space, index) => (
                        <SpacePreview key={space.id} space={space} />
                      ))}
                      <SpacePreview space="more" />
                    </div>
                  ) : (
                    <div className={styles.spaces_empty}>No spaces found</div>
                  )}
                </div>
              </Link>
            </div>
          </ContentCard>

          <ContentCard>
            <div className={styles.info_card}>
              <div className={styles.info_header}>
                <DescriptionIcon sx={{ fontSize: "2.5em" }} />
                <h2 className={styles.info_title}>About</h2>
              </div>
              <div className={styles.info_row}>
                <h3 className={styles.info_subtitle}>Name</h3>
                <p className={styles.info_text}>
                  <span style={{ fontWeight: "bold" }}>{school.name}</span>
                </p>
              </div>
              <div className={styles.info_row}>
                <h3 className={styles.info_subtitle}>Type</h3>
                <p className={styles.info_text}>
                  {school.type === "U" ? "University" : "College"}
                </p>
              </div>
              <div className={styles.info_row}>
                <h3 className={styles.info_subtitle}>City</h3>
                <p className={styles.info_text}>{school.city}</p>
              </div>
              <div className={styles.info_row}>
                <h3 className={styles.info_subtitle}>Province</h3>
                <p className={styles.info_text}>{school.province}</p>
              </div>
              <div className={styles.info_row}>
                <h3 className={styles.info_subtitle}>Description</h3>
                <p className={styles.info_text}>
                  {school.description || (
                    <span style={{ fontStyle: "italic" }}>
                      No description provided
                    </span>
                  )}
                </p>
              </div>
              <div className={styles.info_row}>
                <h3 className={styles.info_subtitle}>Created by</h3>
                <div className={styles.user} style={{}}>
                  <div className={styles.profile_picture}>
                    {userLoading ? (
                      <Skeleton variant="circular" width={30} height={30} />
                    ) : (
                      <Image
                        src={user?.img ? user.img : "/defaultUser.webp"}
                        alt={
                          user
                            ? `${user?.username}'s Profile`
                            : "No profile provided"
                        }
                        width={30}
                        height={30}
                      />
                    )}
                  </div>

                  {userLoading ? (
                    <Skeleton variant="text" width={80} />
                  ) : (
                    <p className={styles.username}>{user?.username || ""}</p>
                  )}
                </div>
              </div>
            </div>
          </ContentCard>
        </main>
      </div>
    </>
  );
}

// Get all school ids for dynamic routing
export async function getStaticPaths() {
  let ids;

  try {
    ids = await getSQLData(`SELECT uni_id AS id FROM university`, []);
  } catch (err) {
    console.log(err);
  }

  const paths = ids.map((id) => ({
    params: {
      id: `${id.id}`,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

// Get data for school with matching id
export async function getStaticProps({ params }) {
  // Get school
  const { id } = params;
  let school;

  const response = await getSchoolById({ query: { schoolId: id } });
  if (response.status === 200) school = response.json;
  else return { notFound: true };

  // Get max 5 spaces
  let spaces;
  const spaceResponse = await getSpaces({
    query: { schoolId: id, limit: 5 },
  });
  if (spaceResponse.status === 200) spaces = spaceResponse.json;
  else return { notFound: true };

  return {
    props: { school: school, spaces: spaces },
    revalidate: 5,
  };
}
