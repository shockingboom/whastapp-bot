import "colors";
import App from "./app";
import { config } from "./config";
import { whatsappService } from "./services";
import { logger } from "./utils";

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

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

bootstrap().catch((error: Error) => {
  console.error("Fatal error during bootstrap:", error);
  process.exit(1);
});
