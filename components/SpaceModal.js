import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useRef, useState } from "react";
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
import { useSpaceLiked } from "../utils/useSpaceLiked";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { useAllTags } from "../utils/useAllTags";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";

export default function Modal({ open, setOpen, space }) {
  const router = useRouter();
  const theme = createTheme({
    palette: {
      primary: {
        main: "rgb(255, 77, 77)",
      },
    },
  });

  const { tags, loading: tagsLoading } = useTags(space?.id);
  const { user: creator, loading: userLoading } = useUserFetching(
    space?.created_by_id
  );
  const { user, loading, error } = useUser();
  const { liked, loading: likedLoading } = useSpaceLiked(space?.id);
  const { tags: allTags, loading: allTagsLoading } = useAllTags();

  const [likeClicked, setLikeClicked] = useState({});
  const [likes, setLikes] = useState({});

  const isCreator =
    user?.user_id === creator?.user_id && !userLoading && !loading;

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [newDesc, setNewDesc] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Load tags into newTags state
  useEffect(() => {
    console.log("useeffect 3");
    if (!tags) return;
    setNewTags(tags);
    // Necessary to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tags)]);

  // Update likes state when space changes to a unique space,
  // and update newName and newDesc state when space changes
  useEffect(() => {
    console.log("useeffect 1");
    if (!space) return;
    if (likes[space.id] === undefined) {
      setLikes((prev) => {
        return { ...prev, [space.id]: space.likes };
      });
    }
  }, [space, likes]);

  // Update likeClicked state when liked state changes
  useEffect(() => {
    console.log("useeffect 2");
    if (!space) return;

    if (!likedLoading && liked && likeClicked[space.id] === undefined) {
      setLikeClicked((prev) => {
        return { ...prev, [space.id]: true };
      });
    }
  }, [liked, likedLoading, likeClicked, space]);

  // State for toast messages
  const [success, setSuccess] = useState(false);
  const [notLogged, setNotLogged] = useState(false);
  const [internalError, setInternalError] = useState(false);
  const [editError, setEditError] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  function checkIfParentElementClicked(e) {
    if (e.target !== e.currentTarget) return;
    closeModal();
  }

  function closeModal() {
    setEditing(false);
    setNewTags([]);
    setOpen(null);
    setSuccess(false);
    setNotLogged(false);
    setInternalError(false);
  }

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
  function handleCloseEditError(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setEditError(false);
  }
  function handleCloseEditSuccess(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setEditSuccess(false);
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
    if (likedLoading || !space) return;

    fetch(`/api/spaces/${space.id}/likes`, {
      method: likeClicked[space.id] ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => console.log(data));

    setLikes((prev) => {
      return {
        ...prev,
        [space.id]: likeClicked[space.id]
          ? prev[space.id] - 1
          : prev[space.id] + 1,
      };
    });
    setLikeClicked((prev) => {
      return { ...prev, [space.id]: likeClicked[space.id] ? false : true };
    });
    setSuccess(true);
  }

  function handleEditClick() {
    setNewName(space.name);
    setNewTags(tags);
    setNewDesc(space.description || "");
    setEditing(true);
  }

  function handleEdit(e) {
    e.preventDefault();
    setSubmittingEdit(true);

    const newTagIDs = newTags.map((tag) => tag.id);
    const oldTagIDs = tags.map((tag) => tag.id);

    const tagsToAdd = newTagIDs.filter((id) => !oldTagIDs.includes(id));
    const tagsToRemove = oldTagIDs.filter((id) => !newTagIDs.includes(id));

    const promises = [];

    // Adding and deleting tags
    tagsToAdd.forEach((id) => {
      promises.push(
        fetch(`/api/spaces/${space.id}/tags/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tag_id: id }),
        })
      );
    });
    tagsToRemove.forEach((id) => {
      promises.push(
        fetch(`/api/spaces/${space.id}/tags/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
      );
    });

    // Space name and description
    promises.push(
      fetch(`/api/spaces/${space.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName, description: newDesc }),
      })
    );

    Promise.all(promises)
      .then((responses) => {
        if (responses.some((res) => !res.ok)) {
          throw new Error();
        }

        // Success editing
        setEditSuccess(true);
        setTimeout(() => {
          router.reload();
        }, 2000);
      })
      .catch(() => {
        setEditError(true);
        setSubmittingEdit(false);
      });
  }

  const signinButton = (
    <Link href="/signin">
      <span style={{ fontFamily: "inherit", textDecoration: "underline" }}>
        Sign in
      </span>
    </Link>
  );

  if (!open) return null;

  const modalNotEditing = (
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
          <div className={styles.icons}>
            {isCreator && (
              <Tooltip
                title="Edit space (only you can see this)"
                onClick={() => handleEditClick()}
              >
                <IconButton aria-label="edit">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Close">
              <IconButton aria-label="close" onClick={() => closeModal()}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </div>
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

          {!likedLoading ? (
            <div
              className={`${styles.likes} ${cardStyles.likes}`}
              style={{
                color: likeClicked[space.id] ? "rgb(255, 77, 77)" : "black",
              }}
            >
              <IconButton
                onClick={handleLike}
                sx={{ color: "inherit" }}
                aria-label="like"
              >
                <ThumbUpIcon />
              </IconButton>
              {likes[space.id]}
            </div>
          ) : (
            <CircularProgress />
          )}
        </div>
      </div>

      <Snackbar
        open={notLogged}
        autoHideDuration={5000}
        onClose={handleCloseNotLogged}
      >
        <Alert severity="error" onClose={handleCloseNotLogged}>
          Oops! You must be signed in to continue. {signinButton}
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
          {!likeClicked[space?.id] ? "Unliked" : "Liked"}!
        </Alert>
      </Snackbar>
    </div>
  );

  const modalEditing = (
    <div
      className={styles.bg}
      style={{ visibility: open ? "visible" : "hidden" }}
      onClick={checkIfParentElementClicked}
    >
      <div
        className={styles.modal}
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        <form onSubmit={handleEdit}>
          <div className={styles.top}>
            {/* <h1 className={styles.name}>{space?.name}</h1> */}
            <TextField
              label="Name"
              variant="standard"
              size="medium"
              InputProps={{
                style: { fontSize: "1.5em", fontWeight: "bold" },
                readOnly: submittingEdit,
              }}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />

            <div className={styles.icons}>
              <ThemeProvider theme={theme}>
                <div className={styles.edit_buttons}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    disabled={submittingEdit}
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    type="submit"
                    disabled={submittingEdit}
                  >
                    Save
                  </Button>
                </div>
              </ThemeProvider>
            </div>
          </div>

          <Autocomplete
            multiple
            options={allTags || []}
            loading={allTagsLoading}
            getOptionLabel={(tag) => tag.name}
            value={newTags}
            onChange={(event, newValue) => {
              setNewTags(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            readOnly={submittingEdit}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Tags" />
            )}
            renderTags={(tags, getTagProps) =>
              tags.map((tag, index) => (
                <Chip
                  variant="outlined"
                  label={tag.name}
                  key={tag.id}
                  sx={{
                    backgroundColor: tag.color || "rgb(0, 0, 84)",
                    color: "white",
                    "& .MuiChip-deleteIcon": {
                      color: "white",
                    },
                    "& .MuiChip-deleteIcon:hover": {
                      color: "lightgray",
                    },
                    fontWeight: 600,
                  }}
                  deleteIcon={<CloseIcon />}
                  {...getTagProps({ index })}
                />
              ))
            }
            sx={{ marginBottom: "25px" }}
          />

          <div className={styles.content}>
            <div className={styles.picture}>
              <a href={space?.img || "/defaultSpace.jpg"}>
                <Image
                  src={space?.img || "/defaultSpace.jpg"}
                  alt={space?.name || "No image provided"}
                  fill
                />
              </a>
            </div>

            <TextField
              id="outlined-multiline-static"
              label="Description"
              variant="standard"
              multiline
              rows={5}
              sx={{ flex: 4 }}
              value={newDesc}
              InputProps={{
                readOnly: submittingEdit,
              }}
              onChange={(e) => setNewDesc(e.target.value)}
            />
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

            {!likedLoading ? (
              <div
                className={`${styles.likes} ${cardStyles.likes}`}
                style={{
                  color: likeClicked[space.id] ? "rgb(255, 77, 77)" : "black",
                }}
              >
                <IconButton
                  onClick={handleLike}
                  sx={{ color: "inherit" }}
                  aria-label="like"
                >
                  <ThumbUpIcon />
                </IconButton>
                {likes[space.id]}
              </div>
            ) : (
              <CircularProgress />
            )}
          </div>
        </form>
      </div>

      <Snackbar
        open={notLogged}
        autoHideDuration={5000}
        onClose={handleCloseNotLogged}
      >
        <Alert severity="error" onClose={handleCloseNotLogged}>
          Oops! You must be signed in to continue. {signinButton}
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
          {!likeClicked[space?.id] ? "Unliked" : "Liked"}!
        </Alert>
      </Snackbar>

      <Snackbar
        open={editError}
        autoHideDuration={5000}
        onClose={handleCloseEditError}
      >
        <Alert severity="error" onClose={handleCloseEditError}>
          Error editing space!
        </Alert>
      </Snackbar>

      <Snackbar
        open={editSuccess}
        autoHideDuration={3000}
        onClose={handleCloseEditSuccess}
      >
        <Alert severity="success" onClose={handleCloseEditSuccess}>
          Changes saved successfully! Reloading...
        </Alert>
      </Snackbar>
    </div>
  );

  return editing ? modalEditing : modalNotEditing;
}
