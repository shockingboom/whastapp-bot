// File: src/routes/index.ts
// Deskripsi: Penghubung untuk semua route API. Saat ini hanya
// men- mount router pesan di path /api.
import { Express } from "express";
import { messageRoutes } from "./message.routes";

export const setupRoutes = (app: Express): void => {
  app.use(`/api`, messageRoutes);
};
