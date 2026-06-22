import { Elysia } from "elysia";
import { getDb } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => {
    return { message: "Hello World" };
  })
  .get("/users", async () => {
    try {
      const db = await getDb();
      const allUsers = await db.select().from(users);
      return { data: allUsers };
    } catch (error) {
      return { error: "Database connection failed", detail: String(error) };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
