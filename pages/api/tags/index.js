import { getSQLData } from "../../../utils/sqlQuery";
import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getSession } from "../sessions";

/**
 * GET /tags
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Tag/getTags
 */
export async function getTags() {
  let tags;
  try {
    tags = await getSQLData(
      `SELECT tag_id AS id, name, color, BIN_TO_UUID(created_by) AS created_by_id FROM tag`,
      []
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return { status: 200, json: tags };
}

/**
 * POST /tags
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Tag/addTag
 */
export async function addTag(req) {
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }

  const { user_id } = session.json;

  // Name of tag
  const { name } = req.body;

  // Validate name and spaceId
  if (!name) return generateHTTPRes(400, "Name is required");
  if (name.length > 50)
    return generateHTTPRes(400, "Name is at most 50 characters");

  // Check if tag name already exists
  let tag;
  try {
    tag = await getSQLData(
      `SELECT COUNT(tag_id) AS count FROM tag WHERE name = ?`,
      [name]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }
  if (tag[0].count > 0)
    return generateHTTPRes(400, `Tag with name '${name}' already exists`);

  // Write data to tag table
  let sql = `INSERT INTO tag(name, created_by) VALUES(?, UUID_TO_BIN(?))`;
  let queries = [name, user_id];
  let tagId;
  try {
    const response = await getSQLData(sql, queries);

    if (response.affectedRows === 0) {
      return generateHTTPRes(500, "MySQL error, 0 affected rows");
    } else {
      tagId = response.insertId;
    }
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return generateHTTPRes(201, "Successfully added tag");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getTags();
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addTag(req);
    res.status(status).json(json);
  } else res.status(405).json({ code: 405, message: "Method not allowed" });
}
