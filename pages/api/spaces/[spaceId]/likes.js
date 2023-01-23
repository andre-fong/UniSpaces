import { getSQLData } from "../../../../utils/sqlQuery";
import { generateHTTPRes } from "../../../../utils/generateHTTPRes";
import { getSession } from "../../sessions";

/**
 * GET /spaces/{spaceId}/likes
 *
 * ***NOT DOCUMENTED***
 */
export async function getSpaceLiked(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;
  const { spaceId } = req.query;

  // // Check if space exists
  // let space;
  // try {
  //   space = await getSQLData(
  //     `SELECT space_id, BIN_TO_UUID(created_by) AS created_by FROM space WHERE space_id = ?`,
  //     [spaceId]
  //   );
  // } catch (err) {
  //   return generateHTTPRes(500, "Internal server error", err);
  // }

  // if (space.length === 0)
  //   return generateHTTPRes(404, `Space not found with id ${spaceId}`);

  // Check if user has already liked space
  let like;
  try {
    like = await getSQLData(
      `SELECT COUNT(*) AS count FROM liked_by WHERE space_id = ? AND user_id = UUID_TO_BIN(?)`,
      [spaceId, user_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }
  if (like[0].count) return generateHTTPRes(200, true);
  return generateHTTPRes(200, false);
}

/**
 * POST /spaces/{spaceId}/likes
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Space/addSpaceLike
 */
export async function addSpaceLike(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;
  const { spaceId } = req.query;

  // Check if space exists
  let space;
  try {
    space = await getSQLData(
      `SELECT space_id, BIN_TO_UUID(created_by) AS created_by FROM space WHERE space_id = ?`,
      [spaceId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (space.length === 0)
    return generateHTTPRes(404, `Space not found with id ${spaceId}`);

  // Check if user has already liked space
  let like;
  try {
    like = await getSQLData(
      `SELECT COUNT(*) AS count FROM liked_by WHERE space_id = ? AND user_id = UUID_TO_BIN(?)`,
      [spaceId, user_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }
  if (like[0].count) return generateHTTPRes(400, "Space already liked");

  // Add like
  let response;
  try {
    response = await getSQLData(
      `INSERT INTO liked_by(space_id, user_id) VALUES(?, UUID_TO_BIN(?))`,
      [spaceId, user_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0)
    return generateHTTPRes(500, "MySQL error, 0 affected rows");

  return generateHTTPRes(201, "Successfully added like to space");
}

/**
 * DELETE /spaces/{spaceId}/likes
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Space/deleteSpaceLike
 */
export async function deleteSpaceLike(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;
  const { spaceId } = req.query;

  // Check if like exists
  let like;
  try {
    like = await getSQLData(
      `SELECT COUNT(*) AS count FROM liked_by WHERE space_id = ? AND user_id = UUID_TO_BIN(?)`,
      [spaceId, user_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (like[0].count === 0) return generateHTTPRes(404, "Like not found");

  // Delete like
  let response;
  try {
    response = await getSQLData(
      `DELETE FROM liked_by WHERE space_id = ? AND user_id = UUID_TO_BIN(?)`,
      [spaceId, user_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0)
    return generateHTTPRes(500, "MySQL error, 0 affected rows");

  return generateHTTPRes(200, "Successfully deleted like from space");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSpaceLiked(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addSpaceLike(req);
    res.status(status).json(json);
  } else if (req.method === "DELETE") {
    const { status, json } = await deleteSpaceLike(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
