# Fitur: API Login User

## Tujuan
Membuat API endpoint untuk proses autentikasi (login) user. Saat login berhasil, sistem akan melakukan validasi password dan men-generate token (UUID) lalu menyimpannya ke tabel `sessions` di database MySQL.

---

## 1. Update Skema Database

### Tabel `sessions`

Buka file `src/db/schema.ts` dan tambahkan tabel baru `sessions` dengan struktur berikut:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT | Primary Key, Auto Increment |
| `token` | VARCHAR(255) | NOT NULL (berisi UUID token login user) |
| `user_id` | INT | Foreign Key (merujuk ke kolom `id` pada tabel `users`) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

> **Catatan:** Setelah mendefinisikan tabel `sessions`, pastikan untuk menjalankan perintah migrasi agar tabel terbuat di database.
```bash
bun run db:push
```

---

## 2. Implementasi Service Layer

### File: `src/services/users-service.ts`

Tambahkan fungsi baru bernama `loginUser` di dalam file service yang sudah ada. Fungsi ini bertugas menangani logika inti:

1. **Terima parameter** `email` dan `password` (berupa plain text).
2. **Cari user di database** berdasarkan input `email`.
   - Jika user tidak ditemukan → lemparkan error (misal: "Email atau password salah").
3. **Verifikasi password** menggunakan fungsi `compare` dari library `bcryptjs`.
   - Jika password tidak cocok → lemparkan error dengan pesan spesifik `"Password salah"`.
4. **Generate Token** dengan format UUID. Di Bun/Node.js modern, bisa memanfaatkan fungsi bawaan `crypto.randomUUID()`.
5. **Simpan session baru** dengan melakukan operasi `insert` ke tabel `sessions` berisi `token` yang baru digenerate dan `user_id` milik user tersebut.
6. **Return hasil sukses**, fungsi tidak perlu mengembalikan seluruh detail user kecuali diminta (untuk kasus ini, cukup mengonfirmasi sukses atau me-return token jika ingin dipakai lebih lanjut).

---

## 3. Implementasi Route

### File: `src/routes/users-route.ts`

Tambahkan endpoint baru di dalam plugin route `usersRoute` yang sudah ada:

### `POST /api/users/login`

**Request Body:**
```json
{
  "email": "eko@gmail.com",
  "password": "rahasia"
}
```

**Response Body (Sukses - Status 200):**
```json
{
  "data": "User berhasil login"
}
```

**Response Body (Error - Password Salah - Status 400/401):**
```json
{
  "error": "Password salah"
}
```

**Panduan Kode:**
- Pada handler `.post("/users/login", ...)`, tangkap `email` dan `password` dari object `body`.
- Panggil fungsi `loginUser` dari service.
- Gunakan block `try-catch` untuk menangkap error yang dilemparkan dari fungsi `loginUser` (contoh: "Password salah").
- Set `set.status` yang sesuai dengan hasil eksekusi sebelum mengembalikan response body JSON.

---

## 4. Tahapan Implementasi (Step-by-Step)

Untuk implementator (junior programmer atau AI), ikuti urutan berikut secara berurutan:

### Tahap 1: Update Schema Database
1. Buka file `src/db/schema.ts`.
2. Definisikan `export const sessions = mysqlTable("sessions", { ... })`. Jangan lupa mendefinisikan tipe setiap field (`id`, `token`, `userId`, `createdAt`).
3. Jalankan `bun run db:push` di terminal.

### Tahap 2: Update Service
1. Buka file `src/services/users-service.ts`.
2. Import fungsi `compare` dari `bcryptjs`.
3. Import definisi tabel `sessions` dari `../db/schema`.
4. Buat fungsi `export const loginUser = async (email, password) => { ... }`.
5. Tuliskan query untuk mencari user, cek password, generate `crypto.randomUUID()`, dan insert session ke database.

### Tahap 3: Update Route
1. Buka file `src/routes/users-route.ts`.
2. Lakukan chaining endpoint baru di bawah deklarasi `Elysia` yang ada: `.post("/users/login", async ({ body, set }) => { ... })`.
3. Eksekusi fungsi `loginUser` di dalam `try-catch` dan kembalikan JSON spesifik seperti yang diminta pada panduan response body.

### Tahap 4: Testing
1. Jalankan `bun run dev`.
2. Lakukan HTTP request (dengan Postman, cURL, atau ekstensi REST Client) ke `POST http://localhost:3000/api/users/login`.
3. Pastikan pengujian meliputi:
   - Login sukses mengembalikan message "User berhasil login".
   - Login gagal mengembalikan pesan error "Password salah".
   - (Opsional) Cek langsung tabel `sessions` di database untuk memastikan record UUID token baru berhasil masuk.
