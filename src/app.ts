// File: src/app.ts
// Deskripsi: Wrapper kecil di atas Express. Bertugas menginisialisasi
// middleware umum (JSON parsing) dan mendaftarkan route aplikasi.
import "colors";
import express, { Express } from "express";
import { setupRoutes } from "./routes";
import { Logger } from "./utils";

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /** Pasang middleware global (mis. JSON parser) */
  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  /** Pasang routes dari modul `routes` */
  private setupRoutes(): void {
    setupRoutes(this.app);
  }

  /** Mengembalikan instance Express (bila perlu untuk testing) */
  public getApp(): Express {
    return this.app;
  }

  /** Mulai server pada port yang ditentukan */
  public listen(port: number): void {
    this.app.listen(port, () => {
      Logger.info(`Server running on port ${port}`);
    });
  }
}

export default App;
