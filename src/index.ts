// File: src/index.ts
// Deskripsi: Entrypoint aplikasi. Bertanggung jawab untuk mem-bootstrap server
// dan menginisialisasi layanan WhatsApp. Juga mengatur penanganan shutdown
// secara graceful dan penanganan error global.
import "colors";
import App from "./app";
import { config } from "./config";
import { whatsappService } from "./services";
import { logger } from "./utils";

/**
 * Mulai aplikasi: buat instance App, mulai listen pada port, dan
 * inisialisasi whatsappService.
 */
async function bootstrap(): Promise<void> {
  try {
    const app = new App();
    app.listen(config.server.port);

    logger.info("Initializing WhatsApp client...".cyan);
    await whatsappService.initialize();

    logger.info("Server and WhatsApp client initialized!".green.bold);

    setupGracefulShutdown();
  } catch (error) {
    logger.error("Error starting server:", error);
    if (error instanceof Error) {
      logger.error("Error stack:", error.stack);
    }
    process.exit(1);
  }
}

/**
 * Setup penanganan shutdown yang rapi.
 * Saat menerima SIGTERM/SIGINT, layanan WhatsApp akan dimatikan dulu
 * sebelum proses Node.js keluar.
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
      await whatsappService.destroy();

      console.log("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      if (error instanceof Error) {
        logger.error("Error stack:", error.stack);
      }
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// Tangani promise rejection yang tidak ditangani agar proses tidak
// berjalan dalam keadaan tidak konsisten.
process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Tangani uncaught exception untuk memastikan aplikasi berhenti dengan
// log yang jelas ketika terjadi error fatal.
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

bootstrap().catch((error: Error) => {
  console.error("Fatal error during bootstrap:", error);
  process.exit(1);
});
