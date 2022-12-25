import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getSQLData } from "../../../utils/sqlQuery";
import { getSchoolById } from "../schools/[schoolId]";
import { getTagById } from "../tags/[tagId]";
import { getSession } from "../sessions";

/**
 * GET /spaces
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Space/getSpaces
 */
export async function getSpaces(req) {
  const { schoolId, tagId, createdBy, sortBy } = req.query;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  let sql = `SELECT s.space_id AS id, s.name, s.description, i.url AS img, COUNT(l.space_id) AS likes, uni_id AS school_id, BIN_TO_UUID(s.created_by) AS created_by_id
  FROM space AS s
  LEFT JOIN image AS i
  ON s.img_id = i.img_id
  LEFT JOIN liked_by AS l
  ON s.space_id = l.space_id`;
  let queries = [];

  // Validate queries
  if (schoolId) {
    // schoolId should only include digits
    if (!schoolId.match(/^[0-9]+$/)) {
      return generateHTTPRes(400, "School id should only contain digits");
    }

    // Check if school exists
    const school = await getSchoolById(req);
    if (school.status !== 200) return school;

    sql += queries.length > 0 ? " AND " : " WHERE ";
    sql += `s.uni_id = ?`;
    queries.push(schoolId);
  }

  if (tagId) {
    // tagId should only include digits
    if (!tagId.match(/^[0-9]+$/)) {
      return generateHTTPRes(400, "Tag id should only contain digits");
    }

    // Check if tag exists
    const tag = await getTagById(req);
    if (tag.status !== 200) return tag;

    sql += queries.length > 0 ? " AND " : " WHERE ";
    sql += `s.space_id IN (
      SELECT t.space_id
      FROM tagged_with AS t
      WHERE t.tag_id = ?
    )`;
    queries.push(tagId);
  }

  if (createdBy) {
    sql += queries.length > 0 ? " AND " : " WHERE ";
    sql += `s.created_by = UUID_TO_BIN(?)`;
    queries.push(createdBy);
  }

  // Enable COUNT function to be valid in sql
  sql += " GROUP BY s.space_id";

  if (sortBy) {
    if (sortBy === "name") {
      sql += ` ORDER BY s.name`;
    } else if (sortBy === "likes") {
      sql += ` ORDER BY likes DESC`;
    } else {
      return generateHTTPRes(400, "sortBy must be one of 'name' or 'likes'");
    }
  }

  // Add offset and limit
  sql += " LIMIT ? OFFSET ?";
  queries.push(limit);
  queries.push(offset);

  let results;
  try {
    results = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return { status: 200, json: results };
}

/**
 * POST /spaces
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Space/addSpace
 */
export async function addSpace(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  const { name, description, school_id, img_id } = req.body;

  if (!name || !school_id)
    return generateHTTPRes(400, "Name and school_id are required");

  if (name.length > 100)
    return generateHTTPRes(400, "Name is at most 100 characters");

  // Check if school exists
  const school = await getSchoolById({
    query: { schoolId: school_id.toString() },
  });
  if (school.status !== 200) return school;

  let sql = `INSERT INTO space(name, description, uni_id, img_id, created_by)
  VALUES (?, ?, ?, ?, UUID_TO_BIN(?))`;
  let queries = [name, description || null, school_id, img_id || null, user_id];

  let response;
  try {
    response = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0)
    return generateHTTPRes(500, "MySQL error, 0 affected rows");

  return generateHTTPRes(201, "Successfully added space");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSpaces(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addSpace(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
}
