/**
 * Returns whether or not given string is in proper UUID format
 * @param {String} str String to be tested as UUID
 * @returns Boolean if str is UUID
 */
export function isUUID(str) {
  return str.match(
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
  );
}
