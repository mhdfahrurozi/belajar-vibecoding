import { Elysia } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      const { name, email, password } = body as Record<string, any>;
      
      if (!name || !email || !password) {
        set.status = 400;
        return { error: "Name, email, and password are required" };
      }

      const newUser = await registerUser(name, email, password);
      
      set.status = 201;
      return {
        message: "User berhasil dibuat",
        data: newUser
      };
    } catch (error: any) {
      set.status = 400;
      return {
        error: error.message || "Terjadi kesalahan internal"
      };
    }
  });
