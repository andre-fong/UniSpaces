/**
 * Converts abbreviated school type to full school type
 * @param {String} type "U" or "C"
 * @returns Long form of abbreviated school type ("university", "college")
 */
export function typeToSchool(type) {
  if (type === "C") {
    return "college";
  }
  if (type === "U") {
    return "university";
  } else return null;
}

/**
 * Converts full school type to abbreviated school type
 * @param {String} school "university" or "college"
 * @returns Long form of abbreviated school type ("U", "C")
 */
export function schoolToType(school) {
  if (school === "college") {
    return "C";
  }
  if (school === "university") {
    return "U";
  } else return null;
}
