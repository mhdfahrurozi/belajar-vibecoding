import { Elysia } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

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

      const token = await loginUser(email, password);

      set.status = 200;
      return {
        data: "User berhasil login",
        token: token
      };
    } catch (error: any) {
      set.status = error.message === "Password salah" || error.message === "Email atau password salah" ? 401 : 400;
      return {
        error: error.message || "Terjadi kesalahan internal"
      };
    }
  })
  .get("/users/current", async ({ headers, set }) => {
    try {
      const authorization = headers.authorization;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new Error("unauthorized");
      }

      const token = authorization.substring(7);
      const user = await getCurrentUser(token);

      return {
        data: user
      };
    } catch (error: any) {
      set.status = 401;
      return {
        error: error.message === "unauthorized" ? "unauthorized" : "Terjadi kesalahan internal"
      };
    }
  })
  .post("/users/logout", async ({ headers, set }) => {
    try {
      const authorization = headers.authorization;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new Error("unauthorized");
      }

      const token = authorization.substring(7);
      await logoutUser(token);

      return {
        data: "OK"
      };
    } catch (error: any) {
      set.status = 401;
      return {
        error: "Unauthorized"
      };
    }
  });
