# Telkom AI Knowledge Assistant

Prototype AI knowledge chatbot menggunakan React + Vite, Node.js/Express sebagai API proxy, OpenAI Responses API, embeddings, dan RAG sederhana.

## Fitur

- Chat AI berbasis OpenAI Responses API.
- Riwayat percakapan disimpan di browser (`localStorage`).
- Upload PDF dan ekstraksi teks.
- Chunking teks dan embedding menggunakan `text-embedding-3-small`.
- Retrieval berbasis cosine similarity (RAG).
- Markdown, tabel, dan syntax highlighting untuk jawaban kode.
- Daftar dokumen knowledge base dan penghapusan dokumen.

## Prasyarat

- Node.js 20 atau lebih baru.
- API key OpenAI dan akses API yang memiliki billing/credits.
- Koneksi internet untuk memanggil OpenAI API dan mengambil font web.

## Instalasi

1. Ekstrak ZIP dan buka folder proyek di terminal.
2. Install dependency:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`.
4. Isi `OPENAI_API_KEY` pada `.env`. Jangan menaruh API key di file `src/` atau variabel `VITE_*`.

   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-6-luna
   OPENAI_EMBEDDING_MODEL=text-embedding-3-small
   PORT=3001
   CLIENT_ORIGIN=http://localhost:5173
   ```

   Jika model default tidak tersedia pada akun API-mu, ganti `OPENAI_MODEL` dengan model yang tersedia pada project OpenAI API milikmu.

5. Jalankan frontend dan backend bersamaan:

   ```bash
   npm run dev
   ```

6. Buka `http://localhost:5173`.

## Build frontend

```bash
npm run build
```

## Menjalankan backend untuk production

```bash
npm start
```

Backend berjalan pada `http://localhost:3001`. Untuk deployment, sajikan folder `dist` melalui web server dan atur reverse proxy `/api` ke backend.

## Endpoint API

- `GET /api/health` — status backend dan konfigurasi API.
- `GET /api/documents` — daftar dokumen yang diindeks.
- `POST /api/documents` — upload PDF (`multipart/form-data`, field `file`).
- `DELETE /api/documents/:id` — hapus dokumen dari knowledge base.
- `POST /api/chat` — kirim pesan, riwayat, dan opsi RAG.

Contoh body `/api/chat`:

```json
{
  "message": "Apa isi dokumen ini?",
  "history": [],
  "useKnowledge": true
}
```

## Catatan penting untuk prototype

1. **Penyimpanan dokumen masih in-memory.** Dokumen dan embedding akan hilang ketika backend restart. Untuk production, gunakan PostgreSQL + pgvector, Qdrant, Pinecone, atau vector database lain.
2. **Riwayat chat tersimpan di localStorage browser**, bukan akun pengguna atau database server.
3. PDF hasil scan/gambar belum didukung OCR. PDF harus memiliki text layer.
4. Embedding dan chat menggunakan OpenAI API dan dapat menimbulkan biaya API. Periksa harga dan usage di dashboard OpenAI.
5. Tambahkan autentikasi, otorisasi, rate limiting, logging yang aman, validasi file, malware scanning, dan kebijakan retensi sebelum deployment.
6. Jangan unggah dokumen internal/rahasia perusahaan tanpa persetujuan dan kontrol keamanan yang sesuai.
7. Similarity threshold adalah heuristik awal dan perlu dievaluasi menggunakan dataset pertanyaan serta dokumen yang representatif.
8. Chat history di frontend dikirim kembali sebagai konteks beberapa pesan terakhir. Untuk sistem multi-user, validasi identitas dan batas akses di backend.

## Troubleshooting

- `OPENAI_API_KEY belum diatur`: pastikan `.env` berada di root project dan restart server.
- `401 Unauthorized`: periksa API key.
- `429`: periksa rate limit, kuota, dan billing API.
- `PDF hasil scan`: lakukan OCR terlebih dahulu sebelum upload.
- `Failed to fetch`: pastikan backend berjalan pada port 3001 dan Vite proxy aktif.
