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
  .derive(({ headers }) => {
    return {
      get bearerToken() {
        const authorization = headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
          return null;
        }
        return authorization.substring(7);
      }
    };
  })
  .get("/users/current", async ({ bearerToken, set }) => {
    try {
      if (!bearerToken) {
        throw new Error("unauthorized");
      }

      const user = await getCurrentUser(bearerToken);

      return {
        data: user
      };
    } catch (error: any) {
      if (error.message === "unauthorized") {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan internal" };
    }
  })
  .post("/users/logout", async ({ bearerToken, set }) => {
    try {
      if (!bearerToken) {
        throw new Error("unauthorized");
      }

      await logoutUser(bearerToken);

      return {
        data: "OK"
      };
    } catch (error: any) {
      if (error.message === "unauthorized") {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan internal" };
    }
  });
