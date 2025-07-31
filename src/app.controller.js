import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/config/.env.dev") });

import express from "express";
import cors from "cors";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import connectDb from "./db/connection.db.js";
import { globalErrorHandling } from "./utils/response.js";
import { cronjob } from "./cronjob/clearRevokedTokens.js";
const port = process.env.PORT || 3000;
const app = express();

async function bootstrap() {
  //convert buffer data
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  //cors
  app.use(cors());

  //db
  await connectDb();

  //routes
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/auth", authController);
  app.use("/users", userController);

  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: "in-valid app routing" });
  });

  app.use(globalErrorHandling);

  cronjob();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export default bootstrap;
