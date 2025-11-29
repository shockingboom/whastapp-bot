# Alur Kerja Aplikasi dan Chain File

Dokumen ini menjelaskan alur kerja utama aplikasi (bootstrap -> route -> controller -> service -> WhatsApp client) dan chain file yang terlibat. Ditulis dalam Bahasa Indonesia untuk memudahkan pemahaman tim.

Ringkasan singkat

- Aplikasi di-boot melalui `src/index.ts` yang membuat instance `App`, memulai server, dan menginisialisasi `whatsappService`.
- HTTP request masuk ke Express, diarahkan oleh `src/routes/*` ke `src/controllers/*`.
- Controller melakukan validasi dan memanggil `src/services/*` untuk melakukan operasi bisnis (mis. mengirim pesan).
- Utilitas seperti `src/utils/phone.util.ts` dan `src/utils/logger.util.ts` membantu formatting dan logging.

Rincian alur (chain) file

1) src/index.ts (bootstrap)
   - Membuat `App` dan memanggil `app.listen(port)`.
   - Memanggil `whatsappService.initialize()` untuk menghubungkan client WhatsApp.
   - Men-setup graceful shutdown (SIGINT/SIGTERM) yang memanggil `whatsappService.destroy()`.

2) src/app.ts
   - Wrapper Express: memasang middleware global (`express.json()`), dan memanggil `setupRoutes(app)`.

3) src/routes/index.ts dan src/routes/message.routes.ts
   - `setupRoutes` memasang semua router di path `/api`.
   - `message.routes.ts` mendefinisikan POST `/api/send-message` yang meneruskan request ke `messageController.sendMessage`.

4) src/controllers/message.controller.ts
   - Menerima request, mengambil body (`number`, `message`).
   - Validasi: pastikan field ada dan `PhoneUtil.isValidIndonesianNumber(number)`.
   - Format nomor: `PhoneUtil.formatPhoneNumber(number)` -> `628...`.
   - Periksa kesiapan client: `whatsappService.isClientReady()`.
   - Panggil `whatsappService.sendMessage(formattedNumber, message)` dengan timeout (15s).
   - Menerjemahkan hasil ke bentuk `ApiResponse` dan mengembalikan status HTTP sesuai (200, 400, 503, 504, 500).

5) src/services/whatsapp.service.ts
   - Mengelola lifecycle `whatsapp-web.js` Client (LocalAuth, puppeteer options).
   - Setup event handler: `qr`, `authenticated`, `ready`, `message`, `disconnected`.
   - `initialize()` -> memanggil `client.initialize()`.
   - `sendMessage(phoneNumber, message)` -> mengirim pesan ke chatId `${phoneNumber}@c.us`.
   - `isClientReady()` -> status readiness.
   - `destroy()` -> memanggil `client.destroy()` untuk cleanup.

6) src/utils
   - `phone.util.ts` : format dan validasi nomor Indonesia.
   - `logger.util.ts` : wrapper winston untuk logging berwarna dan file.

Catatan operasi dan failure modes

- Jika client WhatsApp belum siap, endpoint akan mengembalikan 503.
- Jika pengiriman memakan waktu lebih dari 15 detik, controller menolak dengan error `send_timeout` dan status 504.
- Jika terjadi disconnect, service mencoba reconnect otomatis.
