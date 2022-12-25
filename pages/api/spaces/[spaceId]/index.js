import { getSQLData } from "../../../../utils/sqlQuery";
import { generateHTTPRes } from "../../../../utils/generateHTTPRes";
import { getSession } from "../../sessions";

/**
 * GET /spaces/{spaceId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Space/getSpaceById
 */
export async function getSpaceById(req) {
  const { spaceId } = req.query;

  /// spaceId should only include digits
  if (!spaceId.match(/^[0-9]+$/)) {
    return generateHTTPRes(400, "Space id should only contain digits");
  }

  let sql = `SELECT s.space_id AS id, s.name, s.description, i.url AS img, COUNT(l.space_id) AS likes, uni_id AS school_id, BIN_TO_UUID(s.created_by) AS created_by_id
  FROM space AS s
  LEFT JOIN image AS i
  ON s.img_id = i.img_id
  LEFT JOIN liked_by AS l
  ON s.space_id = l.space_id
  WHERE s.space_id = ?
  GROUP BY s.space_id`;
  let queries = [spaceId];

  let space;
  try {
    space = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (space.length === 0) {
    return generateHTTPRes(404, `Space not found with id ${spaceId}`);
  }

  return { status: 200, json: space[0] };
}

/**
 * PUT /spaces/{spaceId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Space/updateSpaceById
 */
export async function updateSpaceById(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  const { spaceId } = req.query;

  // Check if space exists, if it does check if user is the creator
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

  if (space[0].created_by !== user_id)
    return generateHTTPRes(403, "Insufficient permissions");

  const { name, description, img_id } = req.body;

  let sql = `UPDATE space SET`;
  let queries = [];

  if (name) {
    sql += queries.length > 0 ? `, name = ?` : ` name = ?`;
    queries.push(name);
  }
  if (description) {
    sql += queries.length > 0 ? `, description = ?` : ` description = ?`;
    queries.push(description);
  }
  if (img_id) {
    // Check if img exists
    let img = await getImageById({ query: { imageId: img_id } });
    if (img.status !== 200) return img;

    sql += queries.length > 0 ? `, ` : ` `;
    sql += `img_id = UUID_TO_BIN(?)`;
    queries.push(img_id);
  }

  sql += ` WHERE space_id = ?`;
  queries.push(spaceId);

  let response;
  try {
    response = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0)
    return generateHTTPRes(500, "MySQL error, 0 affected rows");

  return generateHTTPRes(200, "Successfully updated space");
}

export async function deleteSpaceById(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  const { spaceId } = req.query;

  // Check if space exists, if it does check if user is the creator
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

  if (space[0].created_by !== user_id)
    return generateHTTPRes(403, "Insufficient permissions");

  let sql = `DELETE FROM space WHERE space_id = ?`;
  let queries = [spaceId];
  let response;
  try {
    response = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0)
    return generateHTTPRes(500, "MySQL error, 0 affected rows");

  return generateHTTPRes(200, "Successfully deleted space");
}

export default async function handler(req, res) {
  // Check if req method is GET, PUT, or DELETE
  if (req.method === "GET") {
    const { status, json } = await getSpaceById(req);
    res.status(status).json(json);
  } else if (req.method === "PUT") {
    const { status, json } = await updateSpaceById(req);
    res.status(status).json(json);
  } else if (req.method === "DELETE") {
    const { status, json } = await deleteSpaceById(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
}
