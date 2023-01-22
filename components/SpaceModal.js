import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import styles from "../styles/Modal.module.scss";
import cardStyles from "../styles/Card.module.scss";
import Image from "next/image";
import { useTags } from "../utils/useTags";
import { useUserFetching } from "../utils/useUserFetching";
import { useUser } from "../utils/useUser";
import Tag from "./Tag";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Link from "next/link";

export default function Modal({ open, setOpen, space }) {
  const { tags, loading: tagsLoading } = useTags(space?.id);
  const { user: creator, loading: userLoading } = useUserFetching(
    space?.created_by_id
  );
  const { user, loading, error } = useUser();
  const [liked, setLiked] = useState(false);

  const [success, setSuccess] = useState(false);
  const [notLogged, setNotLogged] = useState(false);
  const [internalError, setInternalError] = useState(false);

  // Add useEffect to fetch if space is already liked by user
  useEffect(() => {
    if (user?.code === 404) return;
    if (loading || error) return;

    // Logic to fetch if space is liked by user
  }, [user, loading, error]);

  function checkIfParentElementClicked(e) {
    if (e.target !== e.currentTarget) return;
    setOpen(null);
  }

  // function handleClose(event, reason) {
  //   if (reason === "clickaway") {
  //     return;
  //   }

  //   setSnackbarOpen(false);
  // }
  function handleCloseSuccess(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setSuccess(false);
  }
  function handleCloseNotLogged(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setNotLogged(false);
  }
  function handleCloseInternalError(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setInternalError(false);
  }

  function handleLike() {
    if (user?.code === 404) {
      setNotLogged(true);
      return;
    }
    if (loading || error) {
      setInternalError(true);
      return;
    }

    // Logic to like/unlike space
    setSuccess(true);
    setLiked(!liked);
  }

  const signinButton = (
    <Link href="/signin">
      <span style={{ fontFamily: "inherit", textDecoration: "underline" }}>
        Sign in
      </span>
    </Link>
  );

  if (!open) return null;

  return (
    <div
      className={styles.bg}
      style={{ visibility: open ? "visible" : "hidden" }}
      onClick={checkIfParentElementClicked}
    >
      <div
        className={styles.modal}
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        <div className={styles.top}>
          <h1 className={styles.name}>{space?.name}</h1>
          <IconButton aria-label="close" onClick={() => setOpen(null)}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className={cardStyles.tags} style={{ marginBottom: 20 }}>
          {!tagsLoading && tags?.map((tag) => <Tag key={tag.id} tag={tag} />)}
        </div>

        <div className={styles.content}>
          <div className={styles.picture}>
            <a href={space?.img || "/defaultSpace.jpg"}>
              <Image
                src={space?.img || "/defaultSpace.jpg"}
                alt={space?.name || "No image provided"}
                priority
                fill
              />
            </a>
          </div>

          <div className={styles.description}>
            {space?.description || "No description provided"}
          </div>
        </div>

        <div className={cardStyles.bottom}>
          <div className={cardStyles.user}>
            <div className={cardStyles.profile_picture}>
              <Image
                src={creator?.img ? creator.img : "/defaultUser.webp"}
                alt={
                  creator
                    ? `${creator.username}'s Profile`
                    : "No profile provided"
                }
                width={30}
                height={30}
              />
            </div>

            <p className={cardStyles.username}>{creator?.username || ""}</p>
          </div>

          <div
            className={`${styles.likes} ${cardStyles.likes}`}
            style={{ color: liked ? "rgb(255, 77, 77)" : "black" }}
          >
            <IconButton
              onClick={handleLike}
              sx={{ color: "inherit" }}
              aria-label="like"
            >
              <ThumbUpIcon />
            </IconButton>
            {liked ? space?.likes + 1 : space?.likes}
          </div>
        </div>
      </div>

      <Snackbar
        open={notLogged}
        autoHideDuration={5000}
        onClose={handleCloseNotLogged}
      >
        <Alert severity="error" onClose={handleCloseNotLogged}>
          Oops! You must be logged in to continue. {signinButton}
        </Alert>
      </Snackbar>

      <Snackbar
        open={internalError}
        autoHideDuration={5000}
        onClose={handleCloseInternalError}
      >
        <Alert severity="error" onClose={handleCloseInternalError}>
          Oops! Something went wrong. Try again later?
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
      >
        <Alert severity="success" onClose={handleCloseSuccess}>
          {/* TODO: REPLACE BELOW */}
          {liked ? "Liked" : "Unliked"}!
        </Alert>
      </Snackbar>
    </div>
  );
}
