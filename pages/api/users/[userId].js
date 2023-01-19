import { getSQLData } from "../../../utils/sqlQuery";
import { generateHTTPRes } from "../../../utils/generateHTTPRes";

/**
 * GET /users/{userId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/User/getUserById
 */
export async function getUserById(req) {
  const { userId } = req.query;

  let sql = `SELECT BIN_TO_UUID(u.user_id) AS user_id, u.username, i.url AS img
  FROM user AS u
  LEFT JOIN image AS i
  ON u.img_id = i.img_id
  WHERE u.user_id = UUID_TO_BIN(?)`;
  let queries = [userId];

  let user;
  try {
    user = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (user.length === 0)
    return generateHTTPRes(404, `User not found with id ${userId}`);

  return { status: 200, json: user[0] };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getUserById(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
}
