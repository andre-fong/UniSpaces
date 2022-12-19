import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getSQLData } from "../../../utils/sqlQuery";
import { getSession } from "../sessions";
import { isProvince } from "../../../utils/validateProvince";

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

  let sql = `SELECT u.uni_id AS id, u.name, u.description, u.type, u.city, u.province, i.url AS img, BIN_TO_UUID(u.created_by) AS created_by_id
  FROM university AS u
  LEFT JOIN image AS i
  ON u.img_id = i.img_id
  WHERE u.uni_id = ?`;
  let queries = [schoolId];
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
      json: { code: 404, message: `No school found with id ${schoolId}` },
    };
  }

  return { status: 200, json: results[0] };
}

/**
 * PUT /schools/{schoolId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/School/updateSchoolById
 */
export async function updateSchoolById(req) {
  // Get school creator id
  const { schoolId } = req.query;

  // schoolId should only include digits
  if (!schoolId.match(/^[0-9]+$/)) {
    return {
      status: 400,
      json: { code: 400, message: "School id should only contain digits" },
    };
  }

  let schoolCreator;
  try {
    const school = await getSQLData(
      "SELECT BIN_TO_UUID(created_by) AS created_by FROM university WHERE uni_id = ?",
      [schoolId]
    );
    if (school.length === 0) {
      return generateHTTPRes(404, `No school found with id ${schoolId}`);
    }
    schoolCreator = school[0].created_by;
  } catch (err) {
    return generateHTTPRes(500, "Internal server error");
  }

  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  // Compare school creator and currently signed in user
  if (schoolCreator !== user_id) {
    return generateHTTPRes(403, "Insufficient permissions");
  }

  const { name, description, type, city, province, img_id } = req.body;

  // Validate body if provided
  if (name && name.length > 50)
    return generateHTTPRes(400, "Name must be 50 characters or less");
  if (type && type !== "U" && type !== "C")
    return generateHTTPRes(400, "Type must be 'U' or 'C'");
  if (city && city.length > 35)
    return generateHTTPRes(400, "City name must be 35 characters or less");
  if (province && !isProvince(province)) {
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

  const valuesToUpdate = [
    { name: name },
    { description: description },
    { type: type },
    { city: city },
    { province: province },
    { img_id: img_id },
  ].filter((param) => {
    return Object.values(param)[0];
  });

  if (valuesToUpdate.length === 0) {
    return generateHTTPRes(400, "No values to update");
  }

  let sql = `UPDATE university SET `;
  let queries = [];

  valuesToUpdate.forEach((value) => {
    if (queries.length > 0) {
      sql += ", ";
    }

    if (Object.keys(value)[0] === "img_id") {
      sql += `img_id = UUID_TO_BIN(?)`;
      queries.push(Object.values(value)[0]);
    } else {
      sql += `${Object.keys(value)[0]} = ?`;
      queries.push(Object.values(value)[0]);
    }
  });

  sql += ` WHERE uni_id = ?`;
  queries.push(schoolId);

  try {
    const response = await getSQLData(sql, queries);

    if (response.affectedRows === 0)
      throw new Error("MySQL error, 0 affected rows");
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return generateHTTPRes(200, "Successfully updated school");
}

/**
 * DELETE /schools/{schoolId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/School/deleteSchoolById
 */
export async function deleteSchoolById(req) {
  const { schoolId } = req.query;

  // schoolId should only include digits
  if (!schoolId.match(/^[0-9]+$/)) {
    return {
      status: 400,
      json: { code: 400, message: "School id should only contain digits" },
    };
  }

  let schoolCreator;
  try {
    const school = await getSQLData(
      "SELECT BIN_TO_UUID(created_by) as created_by FROM university WHERE uni_id = ?",
      [schoolId]
    );
    if (school.length === 0)
      return generateHTTPRes(404, `No school found with id ${schoolId}`);

    schoolCreator = school[0].created_by;
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  // Compare school creator and currently signed in user
  if (schoolCreator !== user_id) {
    return generateHTTPRes(403, "Insufficient permissions");
  }

  let sql = `DELETE FROM university WHERE uni_id = ?`;
  let queries = [schoolId];

  try {
    const response = await getSQLData(sql, queries);

    if (response.affectedRows === 0) {
      throw new Error("MySQL error, 0 affected rows");
    }
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return generateHTTPRes(200, "Successfully deleted school");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getSchoolById(req);
    res.status(status).json(json);
  } else if (req.method === "PUT") {
    const { status, json } = await updateSchoolById(req);
    res.status(status).json(json);
  } else if (req.method === "DELETE") {
    const { status, json } = await deleteSchoolById(req);
    res.status(status).json(json);
  } else res.status(501).json({ code: 501, message: "Not implemented" });
}
