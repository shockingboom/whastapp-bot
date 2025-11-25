import "dotenv/config";

export interface AppConfig {
  server: {
    port: number;

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
    port: Number(process.env["PORT"]) || 5555,
  },
  security: {
    apiKey: process.env["X_API_KEY"] || "silvia-api-key-default",
  },
  whatsapp: {
    puppeteerOptions: {
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
