/**
 * GET /schools/{schoolId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/School/getSchoolById
 */
export async function getSchoolById(req) {
  const { schoolId } = req.query;

  // schoolId should only include digits
  if (!schoolId.match(/^[0-9]+$/)) {
    return {
      status: 400,
      json: { code: 400, message: "School id should only contain digits" },
    };
  }

  let sql = `SELECT u.uni_id AS id, u.name, u.description, u.type, u.city, u.province, u.img_id, BIN_TO_UUID(u.created_by) AS created_by_id FROM university AS u`;
  sql += " WHERE u.uni_id = ?;";
  let queries = [schoolId];

  try {
    const mysql = require("mysql2/promise");
    const connection = mysql.createPool(process.env.DATABASE_URL);

    const [results, fields] = await connection.execute(sql, queries);

    if (results.length === 0) {
      return {
        status: 404,
        json: { code: 404, message: `No school found with id ${schoolId}` },
      };
    }

    return { status: 200, json: results[0] };
  } catch (err) {
    return {
      status: 500,
      json: { code: 500, message: "Internal server error", error: err },
    };
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSchoolById(req);
    res.status(status).json(json);
  } else res.status(501).json({ code: 501, message: "Not implemented" });
}
