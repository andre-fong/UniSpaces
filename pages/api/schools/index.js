import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { schoolToType } from "../../../utils/parseSchoolType";
import { getSQLData } from "../../../utils/sqlQuery";
import { isProvince } from "../../../utils/validateProvince";
import { getSession } from "../sessions";

/**
 * GET /schools
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/School/getSchools
 */
export async function getSchools(req) {
  const { name, similarTo, type, createdBy } = req.query;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  // Allow only one of name or similarTo
  if (name && similarTo) {
    return {
      status: 400,
      json: {
        code: 400,
        message: "Only one of name and similarTo should exist",
      },
    };
  }

  // School type is invalid
  if (type && type !== "university" && type !== "college") {
    return {
      status: 400,
      json: {
        code: 400,
        message: "School type must be 'university' or 'college'",
      },
    };
  }

  // Limit # of rows queried
  if (limit > 20) {
    return {
      status: 400,
      json: {
        code: 400,
        message: "Limit must be at most 20",
      },
    };
  }

  // SQL query
  let sql = `SELECT u.uni_id AS id, u.name, u.description, u.type, u.city, u.province, i.url AS img, BIN_TO_UUID(u.created_by) AS created_by_id
  FROM university AS u
  LEFT JOIN image AS i
  ON u.img_id = i.img_id`;
  let queries = [];

  if (name) {
    sql += " WHERE u.name = ?";
    queries.push(name);
  } else if (similarTo) {
    sql += " WHERE u.name LIKE ?";
    queries.push(`%${similarTo}%`);
  }

  if (type) {
    sql += queries.length > 0 ? " AND " : " WHERE ";
    sql += "u.type = ?";
    queries.push(schoolToType(type));
  }

  if (createdBy) {
    sql += queries.length > 0 ? " AND " : " WHERE ";
    sql += "u.created_by = UUID_TO_BIN(?)";
    queries.push(createdBy);
  }

  // Add offset and limit
  sql += " ORDER BY u.name LIMIT ? OFFSET ?";
  queries.push(limit);
  queries.push(offset);

  let results;

  try {
    results = await getSQLData(sql, queries);
  } catch (err) {
    return {
      status: 500,
      json: { code: 500, message: "Internal server error", error: err },
    };
  }

  return { status: 200, json: results };
}

/**
 * POST /schools
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/School/addSchool
 */
export async function addSchool(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  const { name, description, type, city, province, img_id } = req.body;

  // Validate body
  if (!name || !type || !city || !province)
    return generateHTTPRes(400, "Name, type, city, and province are required");
  if (name.length > 100)
    return generateHTTPRes(400, "Name must be 100 characters or less");
  if (type !== "U" && type !== "C")
    return generateHTTPRes(400, "Type must be 'U' or 'C'");
  if (city.length > 35)
    return generateHTTPRes(400, "City name must be 35 characters or less");
  if (!isProvince(province)) {
    return generateHTTPRes(
      400,
      "Province name is not a valid abbreviation in Canada"
    );
  }

  // Check if img_id is valid
  if (img_id) {
    try {
      const imageCount = await getSQLData(
        `SELECT COUNT(img_id) as count FROM image WHERE img_id = UUID_TO_BIN(?)`,
        [img_id]
      );

      if (imageCount[0].count === 0) {
        return generateHTTPRes(404, "Image not found");
      }
    } catch (err) {
      return generateHTTPRes(500, "Internal server error", err);
    }
  }

  let sql = `INSERT INTO university(name, description, type, city, province, img_id, created_by) VALUES(?, ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))`;
  let queries = [
    name,
    description || null,
    type,
    city,
    province,
    img_id || null,
    user_id,
  ];

  try {
    const response = await getSQLData(sql, queries);

    if (response.affectedRows === 0)
      throw new Error("MySQL error, 0 affected rows");
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return generateHTTPRes(201, "Successfully created school");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSchools(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addSchool(req);
    res.status(status).json(json);
  } else res.status(501).json({ code: 501, message: "Not implemented" });
}
