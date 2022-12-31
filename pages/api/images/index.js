import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getSQLData } from "../../../utils/sqlQuery";
import { getSession } from "../sessions";

/**
 * GET /images
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Image/getImages
 */
export async function getImages(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  let sql = `SELECT BIN_TO_UUID(img_id) AS id, url, BIN_TO_UUID(created_by) AS created_by_id FROM image WHERE created_by = UUID_TO_BIN(?);`;
  let queries = [user_id];
  let images;

  try {
    images = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  return { status: 200, json: images };
}

/**
 * POST /images
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Image/addImage
 */
export async function addImage(req) {
  // Check if logged in
  const session = await getSession(req);

  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }
  const { user_id } = session.json;

  // TODO: Add integration with Cloudinary

  // POST https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload

  return { status: 201, json: { message: "Not done yet" } };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getImages(req);
    res.status(status).json(json);
  } else if (req.method === "POST") {
    const { status, json } = await addImage(req);
    res.status(status).json(json);
  } else res.status(405).json({ code: 405, message: "Method not allowed" });
}
