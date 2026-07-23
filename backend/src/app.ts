import express, { Application } from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import { globalErrorHandler } from "./middlewares/errorHandler/globalErrorHandler.middleware.js";
import { env } from "./config/env.js";

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.app.set("trust proxy", 1);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(morgan("common"));
    this.app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "public", "uploads")),
    );
  }

  private initializeRoutes(): void {
    this.app.get("/", (_req, res) => {
      res.json({ success: true, message: "ECAN Scaffold API is running 🚀" });
    });
    this.app.use("/api", routes);
  }

  private initializeErrorHandling(): void {
    this.app.use(globalErrorHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}
