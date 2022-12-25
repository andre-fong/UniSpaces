import { getSQLData } from "../../../utils/sqlQuery";
import { generateHTTPRes } from "../../../utils/generateHTTPRes";

export async function getTagById(req) {
  const { tagId } = req.query;

  // tagId should only include digits
  if (!tagId.match(/^[0-9]+$/)) {
    return generateHTTPRes(400, "Tag id should only contain digits");
  }

  let sql = `SELECT tag_id AS id, name, color, BIN_TO_UUID(created_by) AS created_by_id FROM tag WHERE tag_id = ?`;
  let queries = [tagId];
  let response;

  try {
    response = await getSQLData(sql, queries);
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.length === 0) {
    return generateHTTPRes(404, `Tag not found with id ${tagId}`);
  }

  return { status: 200, json: response[0] };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { status, json } = await getTagById(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
}
