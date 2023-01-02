import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { getSQLData } from "../../../utils/sqlQuery";
import bcrypt from "bcrypt";
import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getUserById } from "../users/[userId]";

/**
 * GET /sessions
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Session/getSession
 */
export async function getSession(req) {
  const sessionId = getCookie("sessionId", { req });

  if (!sessionId) {
    return {
      status: 404,
      json: { code: 404, message: "Session not provided" },
    };
  }

  let sql = `SELECT BIN_TO_UUID(session_id) AS session_id, BIN_TO_UUID(user_id) AS user_id FROM session WHERE BIN_TO_UUID(session_id) = ?`;
  let queries = [sessionId];
  let results;

  try {
    results = await getSQLData(sql, queries);
  } catch (err) {
    return {
      status: 500,
      json: { code: 500, message: "Internal server error", error: err },
    };
  }

  if (results.length === 0) {
    return {
      status: 404,
      json: { code: 404, message: `Session not found or outdated` },
    };
  }

  // Get user info from results
  const user = await getUserById({ query: { userId: results[0].user_id } });
  if (user.status !== 200) return user;

  return { status: 200, json: user };
}

/**
 * POST /sessions
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Session/addSession
 */
export async function addSession(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return generateHTTPRes(400, "Username and password required");
  }

  let sql = "SELECT user_id, password FROM user WHERE username = ?";
  let queries = [username];
  let results;

  try {
    results = await getSQLData(sql, queries);
  } catch (err) {
    return {
      status: 500,
      json: { code: 500, message: "Internal server error", error: err },
    };
  }

  if (results.length === 0) {
    return {
      status: 401,
      json: { code: 401, message: `Invalid user information` },
    };
  }

  // User obj from db
  const user = results[0];

  const isLogged = await bcrypt.compare(password, user.password);

  if (isLogged) {
    let uid;
    try {
      const crypto = require("crypto");
      uid = crypto.randomUUID();

      // Delete previous session before creating a new one
      const deletedSession = await deleteSession(req, res);

      if (deletedSession.status === 500) return deletedSession;
    } catch (err) {
      return generateHTTPRes(500, "Internal server error", err);
    }

    // Set cookie
    setCookie("sessionId", uid, {
      req,
      res,
      secure: true,
      httpOnly: true,
      sameSite: true,
      maxAge: 6000,
      signed: true,
    });

    // Add sessionId on db
    let sql = `INSERT INTO session(session_id, user_id) VALUES(UUID_TO_BIN(?), ?);`;
    let queries = [uid, user.user_id];

    try {
      const results = getSQLData(sql, queries);

      if (results.affectedRows === 0)
        throw new Error("MySQL error, 0 affected rows");
    } catch (err) {
      return {
        status: 500,
        json: { code: 500, message: "Internal server error", error: err },
      };
    }

    return {
      status: 201,
      json: { code: 201, message: "Successfully created session" },
    };
  } else {
    return {
      status: 401,
      json: { code: 401, message: `Invalid user information` },
    };
  }
}

/**
 * DELETE /sessions
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Session/deleteSession
 */
export async function deleteSession(req, res) {
  const sessionId = getCookie("sessionId", { req });

  if (!sessionId) {
    return {
      status: 404,
      json: { code: 404, message: "Session not provided" },
    };
  }

  let sql = `DELETE FROM session WHERE session_id = UUID_TO_BIN(?)`;
  let queries = [sessionId];

  try {
    const results = await getSQLData(sql, queries);

    if (results.affectedRows === 0) {
      return { status: 404, json: { code: 404, message: "Session not found" } };
    }
  } catch (err) {
    return {
      status: 500,
      json: { code: 500, message: "Internal server error", error: err },
    };
  }

  deleteCookie("sessionId", { req, res });

  return {
    status: 201,
    json: { code: 201, message: "Successfully deleted session" },
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSession(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addSession(req, res);
    res.status(status).json(json);
  } else if (req.method === "DELETE") {
    const { status, json } = await deleteSession(req, res);
    res.status(status).json(json);
  } else res.status(501).json({ code: 501, message: "Not implemented" });
}
