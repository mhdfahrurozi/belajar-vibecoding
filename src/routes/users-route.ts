import { Elysia } from "elysia";
import { registerUser, loginUser } from "../services/users-service";

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
  })
  .post("/users/login", async ({ body, set }) => {
    try {
      const { email, password } = body as Record<string, any>;

      if (!email || !password) {
        set.status = 400;
        return { error: "Email and password are required" };
      }

      await loginUser(email, password);

      set.status = 200;
      return {
        data: "User berhasil login"
      };
    } catch (error: any) {
      set.status = error.message === "Password salah" || error.message === "Email atau password salah" ? 401 : 400;
      return {
        error: error.message || "Terjadi kesalahan internal"
      };
    }
  });
