# Issue: Implementasi Fitur Logout User

## Deskripsi
Buatkan API endpoint untuk melakukan proses logout user. Endpoint ini akan menghapus sesi (session) user yang sedang aktif berdasarkan token yang diberikan, sehingga user tidak lagi memiliki akses yang memerlukan otentikasi.

## Spesifikasi API

- **Method**: `POST`
- **Endpoint**: `/api/users/logout`
- **Otentikasi**: Memerlukan token yang valid.

### Response Sukses
Jika proses logout berhasil dan session berhasil dihapus dari database:
```json
{
    "data": "OK"
}
```

### Response Error
Jika token tidak valid, tidak ditemukan, atau user tidak teregistrasi/belum login:
```json
{
    "error": "Unauthorized"
}
```

## Struktur Folder dan File
Implementasi harus mengikuti arsitektur folder yang sudah ada di dalam direktori `src`:
- **Routes** (`src/routes`): Berisi definisi endpoint menggunakan Elysia JS. Gunakan file `users-route.ts`.
- **Services** (`src/services`): Berisi logika bisnis utama aplikasi. Gunakan file `users-service.ts`.

---

## Tahapan Implementasi

Berikut adalah panduan langkah demi langkah untuk mengimplementasikan fitur logout ini (ditujukan untuk junior programmer atau agen AI):

### Langkah 1: Implementasi Logika Bisnis di `users-service.ts`
Buka file `src/services/users-service.ts` dan tambahkan fungsi/method baru untuk menangani proses logout.
1. Buat fungsi bernama `logout` (atau nama relevan lainnya). Fungsi ini harus menerima parameter berupa `token` (string) yang didapat dari request user.
2. Di dalam fungsi `logout`, lakukan *query* ke database untuk mencari data di tabel `sessions` berdasarkan `token` tersebut.
3. **Pengecekan Error**: Jika data session dengan token tersebut **tidak ditemukan**, throw sebuah error (misalnya `ResponseError` dengan HTTP status 401 dan pesan "Unauthorized").
4. **Proses Sukses**: Jika data session **ditemukan**, hapus baris (record) data session tersebut dari tabel `sessions`.
5. Kembalikan balikan objek berupa `{ data: "OK" }` atau `string "OK"` (yang nanti dibungkus oleh route).

### Langkah 2: Menambahkan Endpoint di `users-route.ts`
Buka file `src/routes/users-route.ts` untuk mendaftarkan endpoint baru.
1. Daftarkan route baru dengan method `POST` di path `/api/users/logout`.
2. Terapkan mekanisme otentikasi/middleware yang sudah ada (misalnya untuk mengekstrak token dari HTTP Header `Authorization` atau variabel context).
3. Di dalam *handler* route tersebut, ambil nilai `token` yang dikirimkan oleh user.
4. Panggil fungsi `logout` dari `users-service.ts` yang sudah dibuat pada Langkah 1 dengan memasukkan variabel token sebagai argumennya.
5. Kembalikan response hasil pemanggilan service.
6. Tangkap *exception* atau error jika service melempar error "Unauthorized", lalu tangani dengan memberikan balikan JSON berupa `{ "error": "Unauthorized" }` disertai HTTP status code `401`.

### Langkah 3: Pengujian (Testing)
Pastikan hal-hal berikut berjalan dengan baik setelah kode selesai ditulis:
1. Kirim *request* `POST` ke `/api/users/logout` membawa token yang tersimpan di database -> Cek apakah response menampilkan `{ "data": "OK" }` dan cek apakah token tersebut benar-benar hilang dari tabel `sessions`.
2. Kirim *request* `POST` ke `/api/users/logout` dengan token asal (salah) atau tanpa token sama sekali -> Cek apakah response menampilkan `{ "error": "Unauthorized" }` dengan HTTP Code 401.

## Acceptance Criteria (Kriteria Selesai)
- [ ] Endpoint `POST /api/users/logout` dapat diakses dengan benar.
- [ ] Logic penghapusan session berjalan sesuai token spesifik user tersebut.
- [ ] Struktur penempatan kode dipisah antara file route dan file service.
- [ ] Error handling berjalan dan format response sesuai spesifikasi.
