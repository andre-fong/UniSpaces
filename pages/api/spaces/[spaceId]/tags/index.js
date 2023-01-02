import { getSQLData } from "../../../../../utils/sqlQuery";
import { generateHTTPRes } from "../../../../../utils/generateHTTPRes";
import { getSession } from "../../../sessions";

/**
 * GET /spaces/{spaceId}/tags
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Tag/getSpaceTags
 */
export async function getSpaceTags(req) {
  const { spaceId } = req.query;

  // spaceId should only include digits
  if (!spaceId.match(/^[0-9]+$/)) {
    return generateHTTPRes(400, "Space id should only contain digits");
  }

  // Check if space exists
  let space;
  try {
    space = await getSQLData(
      `SELECT COUNT(*) AS count FROM space WHERE space_id = ?`,
      [spaceId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (space[0].count === 0)
    return generateHTTPRes(404, `Space not found with id ${spaceId}`);

  // Get tags belonging to space
  let sql = `SELECT tw.tag_id AS id, t.name, t.color, BIN_TO_UUID(t.created_by) AS created_by_id
  FROM tagged_with AS tw
  INNER JOIN tag AS t
  ON tw.tag_id = t.tag_id
  WHERE tw.space_id = ?`;
  let queries = [spaceId];

  let tags;
  try {
    tags = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return { status: 200, json: tags };
}

/**
 * POST /spaces/{spaceId}/tags
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Tag/addSpaceTag
 */
export async function addSpaceTag(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }

  const { spaceId } = req.query;

  // spaceId should only include digits
  if (!spaceId.match(/^[0-9]+$/)) {
    return generateHTTPRes(400, "Space id should only contain digits");
  }

  // Check if space exists
  let space;
  try {
    space = await getSQLData(
      `SELECT COUNT(*) AS count FROM space WHERE space_id = ?`,
      [spaceId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (space[0].count === 0)
    return generateHTTPRes(404, `Space not found with id ${spaceId}`);

  const { tag_id } = req.body;
  if (!tag_id) return generateHTTPRes(400, "tag_id required");

  // Check if tag exists
  let tag;
  try {
    tag = await getSQLData(
      `SELECT COUNT(*) AS count FROM tag WHERE tag_id = ?`,
      [tag_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (tag[0].count === 0)
    return generateHTTPRes(404, `Tag not found with id ${tag_id}`);

  // Check if tag is already added to space
  let taggedWith;
  try {
    taggedWith = await getSQLData(
      `SELECT COUNT(*) AS count FROM tagged_with WHERE space_id = ? AND tag_id = ?`,
      [spaceId, tag_id]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (taggedWith[0].count > 0)
    return generateHTTPRes(400, `Tag already added to space`);

  // Add tag to space
  let sql = `INSERT INTO tagged_with(space_id, tag_id) VALUES(?, ?)`;
  let queries = [spaceId, tag_id];

  let response;
  try {
    response = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0) {
    return generateHTTPRes(500, "Internal server error");
  }

  return generateHTTPRes(200, "Successfully added tag to space");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSpaceTags(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addSpaceTag(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
}
