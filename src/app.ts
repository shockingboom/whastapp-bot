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

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    setupRoutes(this.app);
  }

  public getApp(): Express {
    return this.app;
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      Logger.info(`Server running on port ${port}`);
    });
  }
}

export default App;
