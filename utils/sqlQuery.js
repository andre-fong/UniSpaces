/**
 * Gets data from SQL database
 * @param {String} sql Valid SQL query
 * @param {Array<String>} queries Data for protected query
 * @returns Results from SQL query
 */
export async function getSQLData(sql, queries) {
  const mysql = require("mysql2/promise");
  const connection = mysql.createPool(process.env.DATABASE_URL);

  const [results, fields] = await connection.execute(sql, queries);

  return results;
}
