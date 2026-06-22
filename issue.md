# Fitur: API Get Current User

## Tujuan
Membuat API endpoint untuk mengambil data user yang saat ini sedang login. API ini akan memvalidasi token yang dikirim melalui header `Authorization`, mencarinya di tabel `sessions`, dan mengembalikan data user terkait dari tabel `users`.

---

## 1. Implementasi Service Layer

### File: `src/services/users-service.ts`

Tambahkan fungsi baru bernama `getCurrentUser` di dalam file service. Fungsi ini bertugas untuk:

1. **Terima parameter** `token` (berupa string).
2. **Cari session di database** berdasarkan input `token`. Lakukan operasi `join` antara tabel `sessions` dan `users` untuk mendapatkan data user sekaligus.
   - *Catatan:* Prompt menyebutkan "token yang ada di tabel users", namun secara arsitektur yang sudah kita buat, token disimpan di tabel `sessions` yang memiliki relasi (Foreign Key) ke tabel `users`.
   - Jika token tidak ditemukan di tabel `sessions` → lemparkan error dengan pesan `"unauthorized"`.
3. **Return data user** yang ditemukan.
   - Kembalikan objek yang berisi `id`, `name`, `email`, dan `createdAt` dari tabel `users`. Pastikan Anda **tidak** mengembalikan password.

---

## 2. Implementasi Route

### File: `src/routes/users-route.ts`

Tambahkan endpoint baru di dalam plugin route `usersRoute` yang sudah ada:

### `GET /api/users/current`

**Headers yang diperlukan:**
- `Authorization`: `Bearer <token>` (Contoh: `Bearer 123e4567-e89b-12d3-a456-426614174000`)

**Response Body (Sukses - Status 200):**
```json
{
  "data": {
    "id": 1,
    "name": "Eko",
    "email": "eko@gmail.com",
    "created_at": "2023-10-27T10:00:00.000Z"
  }
}
```

**Response Body (Error - Token Tidak Valid/Tidak Ada - Status 401):**
```json
{
  "error": "unauthorized"
}
```

**Panduan Kode:**
- Pada handler `.get("/users/current", ...)`, ambil header `authorization` dari objek `headers` bawaan context ElysiaJS.
- Ekstrak token dari format `Bearer <token>`. Jika format tidak sesuai atau header tidak ada, set status `401` dan return error `"unauthorized"`.
- Panggil fungsi `getCurrentUser(token)` dari service.
- Gunakan block `try-catch` untuk menangkap error. Jika pesan error adalah `"unauthorized"`, kembalikan status `401`.

---

## 3. Tahapan Implementasi (Step-by-Step)

Untuk implementator (junior programmer atau AI), ikuti urutan berikut secara berurutan:

### Tahap 1: Update Service
1. Buka file `src/services/users-service.ts`.
2. Buat dan export fungsi `export const getCurrentUser = async (token: string) => { ... }`.
3. Tuliskan query Drizzle ORM untuk melakukan operasi inner join. Contoh pendekatannya:
   `db.select().from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(eq(sessions.token, token))`
4. Jika hasil query kosong (array *length* === 0), lempar error `new Error("unauthorized")`.
5. Jika berhasil, return data user dari hasil join dengan format yang sesuai.

### Tahap 2: Update Route
1. Buka file `src/routes/users-route.ts`.
2. Lakukan chaining endpoint baru: `.get("/users/current", async ({ headers, set }) => { ... })`.
3. Validasi header `authorization`. Pastikan ada string yang diawali dengan `"Bearer "` dan ambil nilai tokennya.
4. Panggil `getCurrentUser(token)` di dalam `try-catch` dan kembalikan JSON sesuai format respon sukses. Jika gagal, return status `401` dengan pesan `{"error": "unauthorized"}`.

### Tahap 3: Testing
1. Pastikan server dan MySQL berjalan (`bun run dev`).
2. Lakukan login via endpoint `POST /api/users/login` untuk mendapatkan token yang valid (atau intip langsung token di tabel `sessions` menggunakan tool database).
3. Lakukan HTTP GET request ke `http://localhost:3000/api/users/current` dengan menyertakan header `Authorization: Bearer <token_yang_didapat>`.
4. Pastikan pengujian meliputi:
   - Request dengan token valid mengembalikan data user (status HTTP 200).
   - Request dengan token tidak valid, format salah, atau tanpa token mengembalikan error `{"error": "unauthorized"}` (status HTTP 401).
