import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getSQLData } from "../../../utils/sqlQuery";

/**
 * GET /users
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/User/getUsers
 */
export async function getUsers(req) {
  const { username } = req.query;

  let sql = `SELECT BIN_TO_UUID(u.user_id) AS id, u.username, i.url AS img
  FROM user AS u
  LEFT JOIN image AS i
  ON u.img_id = i.img_id`;
  let queries = [];

  if (username) {
    sql += ` WHERE u.username = ?`;
    queries.push(username);
  }

  let users;
  try {
    users = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return { status: 200, json: users };
}

/**
 * POST /users
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/User/addUser
 */
export async function addUser(req) {
  const { username, password, img_id } = req.body;

  // Username and password required
  if (!username || !password)
    return generateHTTPRes(400, "Username and password required");

  // Username and password limitations
  if (username.length > 40)
    return generateHTTPRes(400, "Username is at most 40 characters long");

  if (password.length < 6 || password.length > 50)
    return generateHTTPRes(400, "Password is 6-50 characters long");

  // Check if username is taken
  const existingUser = await getUsers({ query: { username: username } });
  if (existingUser.status !== 200) return existingUser;

  if (existingUser.json.length > 0)
    return generateHTTPRes(409, "Username already exists");

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

  try {
    // Encrypt password in db
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const saltedPassword = await bcrypt.hash(password, salt);

    let sql = `INSERT INTO user(username, password, img_id) VALUES(?, ?, UUID_TO_BIN(?))`;
    let queries = [username, saltedPassword, img_id || null];

    const response = await getSQLData(sql, queries);

    if (response.affectedRows === 0)
      throw new Error("MySQL error, 0 affected rows");
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return generateHTTPRes(201, `Successfully created user '${username}'`);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getUsers(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addUser(req);
    res.status(status).json(json);
  } else res.status(501).json({ code: 501, message: "Not implemented" });
}
