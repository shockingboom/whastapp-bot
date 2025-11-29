// File: src/config/app.config.ts
// Deskripsi: Konfigurasi aplikasi dan nilai default yang diambil dari
// environment variables (.env). Ubah nilai default di sini jika diperlukan.
import "dotenv/config";

export interface AppConfig {
  server: {
    port: number;
    serverUrl?: string;
  };
  security: {
    apiKey: string;
  };
  whatsapp: {
    puppeteerOptions: {
      headless: boolean;
      args: string[];
    };
  };
}

export const config: AppConfig = {
  server: {
    // PORT: port yang digunakan server, default 5555
    port: Number(process.env["PORT"]) || 5555,
    // SERVER_URL: jika aplikasi perlu mem-ping endpoint untuk keep-alive
    serverUrl: process.env["SERVER_URL"] || undefined,
  },
  security: {
    // X_API_KEY: nilai default untuk proteksi API (tidak diwajibkan saat ini)
    apiKey: process.env["X_API_KEY"] || "silvia-api-key-default",
  },
  whatsapp: {
    puppeteerOptions: {
      // Jalankan puppeteer headless secara default. Ubah ke false bila perlu
      // melihat browser saat debugging.
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    },
  },
};
