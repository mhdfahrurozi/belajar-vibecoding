import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let _db: MySql2Database<typeof schema> | null = null;

export async function getDb() {
  if (!_db) {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "first_project",
    });

    _db = drizzle(pool, { schema, mode: "default" });
  }
  return _db!;
}
