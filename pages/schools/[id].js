import React from "react";
import { getSQLData } from "../../utils/sqlQuery";
import { getSchoolById } from "../api/schools/[schoolId]";
import { getSpaces } from "../api/spaces";
import styles from "../../styles/SchoolPage.module.scss";
import Head from "next/head";
import Image from "next/image";
import SpaceCard from "../../components/SpaceCard";

export default function SchoolSpaces({ school, spaces }) {
  return (
    <>
      <Head>
        <title>{`${school.name}'s Spaces | UniSpaces`}</title>
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
        <main className={styles.main}>
          <h2 className={styles.results_header}>
            Showing {spaces.length} space{spaces.length === 1 ? "" : "s"} for{" "}
            {school.name}:
          </h2>
          <div className={styles.results}>
            {spaces.length > 0 &&
              spaces.map((space) => <SpaceCard key={space.id} space={space} />)}
          </div>
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

  // Get spaces
  let spaces;
  const spaceResponse = await getSpaces({ query: { schoolId: id } });
  if (spaceResponse.status === 200) spaces = spaceResponse.json;
  else return { notFound: true };

  return {
    props: { school: school, spaces: spaces },
    revalidate: 10,
  };
}
