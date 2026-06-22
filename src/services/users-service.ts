import { getDb } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const registerUser = async (name: string, email: string, passwordPlain: string) => {
  const db = await getDb();

  // 1. Cek apakah email sudah terdaftar
  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  if (existingUsers.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(passwordPlain, saltRounds);

  // 3. Insert user baru
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Ambil data user yang baru dibuat untuk dikembalikan (tanpa password)
  const [newUser] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email
  }).from(users).where(eq(users.email, email));

  return newUser;
};

export const loginUser = async (email: string, passwordPlain: string) => {
  const db = await getDb();

  // 1. Cari user berdasarkan email
  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  if (existingUsers.length === 0) {
    throw new Error("Email atau password salah");
  }

  const user = existingUsers[0];

  // 2. Verifikasi password
  const isValidPassword = await bcrypt.compare(passwordPlain, user.password);
  if (!isValidPassword) {
    throw new Error("Password salah");
  }

  // 3. Generate Token UUID
  const token = crypto.randomUUID();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 5. Kembalikan token
  return token;
};
