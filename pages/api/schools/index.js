import { schoolToType } from "../../../utils/parseSchoolType";

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
  let sql = `SELECT u.uni_id AS id, u.name, u.description, u.type, u.city, u.province, u.img_id, BIN_TO_UUID(u.created_by) AS created_by_id FROM university AS u`;
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
  sql += " LIMIT ? OFFSET ?;";
  queries.push(limit, offset);

  try {
    const mysql = require("mysql2/promise");
    const connection = mysql.createPool(process.env.DATABASE_URL);

    const [results, fields] = await connection.execute(sql, queries);

    return { status: 200, json: results };
  } catch (err) {
    return {
      status: 500,
      json: { code: 500, message: "Internal server error", error: err },
    };
  }
}

/**
 * POST /schools
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/School/addSchool
 */
export async function addSchool(req) {
  const { name, description, type, city, province } = req.body;
  const img_id = parseInt(req.body.img_id);

  // TODO: Implement once login is finished

  return { status: 501, json: { message: "Unimplemented" } };
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
