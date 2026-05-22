const { createClient } = require('@libsql/client');
require('dotenv').config();

console.log("URL:", process.env.TURSO_DATABASE_URL);

try {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  libsql.execute("SELECT 1").then(console.log).catch(console.error);
} catch (e) {
  console.error("Init error:", e);
}
