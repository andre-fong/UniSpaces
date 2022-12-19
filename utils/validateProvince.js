/**
 * Validates if string is a valid province abbreviation in Canada
 * @param {String} str String to be tested against
 * @returns True if valid, false if not
 */
export function isProvince(str) {
  const provinces = [
    "NL",
    "PE",
    "NS",
    "NB",
    "QC",
    "ON",
    "MB",
    "SK",
    "AB",
    "BC",
    "YT",
    "NT",
    "NU",
  ];

  return provinces.includes(str);
}
