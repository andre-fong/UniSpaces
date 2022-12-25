import { generateHTTPRes } from "../../../../../utils/generateHTTPRes";
import { getSQLData } from "../../../../../utils/sqlQuery";
import { getSession } from "../../../sessions";

/**
 * DELETE /spaces/{spaceId}/tags/{tagId}
 *
 * https://app.swaggerhub.com/apis-docs/andre-fong/UniSpaces/1.0.0#/Tag/deleteSpaceTag
 */
export async function deleteSpaceTag(req) {
  // Check if logged in
  const session = await getSession(req);
  if (session.status !== 200) {
    return generateHTTPRes(401, "Not signed in", session.err);
  }

  const { spaceId, tagId } = req.query;

  // Space and tag id should only include digits
  if (!spaceId.match(/^[0-9]+$/) || !tagId.match(/^[0-9]+$/)) {
    return generateHTTPRes(400, "Space and tag id should only contain digits");
  }

  // Check if space exists
  let space;
  try {
    space = await getSQLData(
      `SELECT COUNT(*) AS count FROM space WHERE space_id = ?`,
      [spaceId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (space[0].count === 0)
    return generateHTTPRes(404, `Space not found with id ${spaceId}`);

  // Check if tag exists
  let tag;
  try {
    tag = await getSQLData(
      `SELECT COUNT(*) AS count FROM tag WHERE tag_id = ?`,
      [tagId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (tag[0].count === 0)
    return generateHTTPRes(404, `Tag not found with id ${tagId}`);

  // Check if space-tag relationship exists
  let spaceTag;
  try {
    spaceTag = await getSQLData(
      `SELECT COUNT(*) AS count FROM tagged_with WHERE space_id = ? AND tag_id = ?`,
      [spaceId, tagId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (spaceTag[0].count === 0)
    return generateHTTPRes(
      404,
      `Tag with id ${tagId} not found for space with id ${spaceId}`
    );

  // Delete space-tag relationship
  let response;
  try {
    response = await getSQLData(
      `DELETE FROM tagged_with WHERE space_id = ? AND tag_id = ?`,
      [spaceId, tagId]
    );
  } catch (err) {
    return generateHTTPRes(500, "Internal server error", err);
  }

  if (response.affectedRows === 0)
    return generateHTTPRes(500, "MySQL error, 0 affected rows");

  return generateHTTPRes(200, "Tag deleted from space");
}

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { status, json } = await deleteSpaceTag(req);
    res.status(status).json(json);
  } else {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
}
