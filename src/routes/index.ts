import { Express } from "express";
import { messageRoutes } from "./message.routes";

export const setupRoutes = (app: Express): void => {
  app.use(`/api`, messageRoutes);
};
