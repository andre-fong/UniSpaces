import { generateHTTPRes } from "../../../utils/generateHTTPRes";
import { getSQLData } from "../../../utils/sqlQuery";
import { isUUID } from "../../../utils/validateUUID";

/**
 * GET /images/{imageId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Image/getImageById
 */
export async function getImageById(req) {
  const { imageId } = req.query;

  // Validate uuid format
  if (!isUUID(imageId))
    return generateHTTPRes(400, "Image id is not a valid UUID");

  let sql = `SELECT BIN_TO_UUID(img_id) AS id, url, BIN_TO_UUID(created_by) AS created_by_id FROM image WHERE img_id = UUID_TO_BIN(?);`;
  let queries = [imageId];
  let image;

  try {
    image = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (image.length === 0)
    return generateHTTPRes(404, `No image found with id ${imageId}`);

  return { status: 200, json: image[0] };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getImageById(req);
    res.status(status).json(json);
  } else res.status(501).json({ code: 501, message: "Not implemented" });
}
