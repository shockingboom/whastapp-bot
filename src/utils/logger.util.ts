// File: src/utils/logger.util.ts
// Deskripsi: Wrapper untuk winston logger. Menyediakan format keluaran
// yang ramah pembacaan di console dan format JSON untuk file log.
import "colors";
import winston from "winston";

const { combine, timestamp, printf, colorize, align } = winston.format;

// Format custom untuk keluaran console (berwarna)
const consoleFormat = printf((info) => {
  const { timestamp, level, message, ...metadata } = info;
  const ts = new Date(timestamp as string).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let msg = `[${ts}] ${level}: ${message}`;

  // Tambahkan metadata bila ada
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Format custom untuk file log (JSON)
const fileFormat = printf((info) => {
  const { timestamp, level, message, ...metadata } = info;
  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    message,
  };

  // Tambahkan metadata bila ada
  if (Object.keys(metadata).length > 0) {
    logEntry["metadata"] = metadata;
  }

  return JSON.stringify(logEntry);
});

// Buat instance logger
export const logger = winston.createLogger({
  level: process.env["LOG_LEVEL"] || "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    align()
  ),
  transports: [
    // Console transport berwarna
    new winston.transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
    }),
    // File transport untuk error
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    // File transport untuk semua log
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [new winston.transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new winston.transports.File({ filename: "logs/rejections.log" })],
});

// Kelas helper untuk memudahkan logging di kode lain
export class Logger {
  static info(message: string, metadata?: Record<string, unknown>): void {
    logger.info(message, metadata);
  }

  static error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorDetails =
      error instanceof Error
        ? { error: error.message, stack: error.stack }
        : { error: String(error) };

    logger.error(message, { ...errorDetails, ...metadata });
  }

  static warn(message: string, metadata?: Record<string, unknown>): void {
    logger.warn(message, metadata);
  }

  static debug(message: string, metadata?: Record<string, unknown>): void {
    logger.debug(message, metadata);
  }

}

export default Logger;
