/**
 * Generates a response object with a status and json to append on HTTP response
 * @param {Number} status Valid http status (excluding 204)
 * @param {String} message A message to go in JSON
 * @param {Object} err An error object containing details about error
 */
export function generateHTTPRes(status, message, err) {
  const res = {
    status: status,
    json: { code: status, message: message },
  };

  if (err) res.json.err = err;

  return res;
}
