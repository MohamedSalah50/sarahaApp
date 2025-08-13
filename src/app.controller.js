import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/config/.env.dev") });

import express from "express";
import cors from "cors";
import morgan from "morgan"
import { rateLimit } from 'express-rate-limit'
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import messageController from "./modules/message/message.controller.js"
import connectDb from "./db/connection.db.js";
import { globalErrorHandling } from "./utils/response.js";
import { cronjob } from "./utils/cronjob/clearRevokedTokens.js";
const port = process.env.PORT || 3000;
const app = express();


// var whitelist = ['http://127.0.0.1:3000', 'http://127.0.0.1:8000']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

async function bootstrap() {
  //convert buffer data
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  //cors
  app.use(cors());
  // app.use(morgan("dev"))
  

  const limiter = rateLimit({
	windowMs:60 * 1000, // 1 minutes
	limit: 3,
  message:{error:"no more result wait 1min"},
  handler:(req,res,next,options)=>{
    res.status(403).json({message:"many requests"})
  },
  standardHeaders:"draft-8" 
})

// app.use(limiter)
  //db
  await connectDb();


// var whitelist = ['http://127.0.0.1:3000', 'http://127.0.0.1:8000'];
  // app.use(async (req, res, next) => {
  //       if (!whitelist.includes(req.header('origin'))) {
  //           return next(new Error('Not Allowed By CORS', { status: 403 }))
  //       }
  //       for (const origin of whitelist) {
  //           if (req.header('origin') == origin) {
  //               await res.header('Access-Control-Allow-Origin', origin);
  //               break;
  //           }
  //       }
  //       await res.header('Access-Control-Allow-Headers', '*')
  //       await res.header("Access-Control-Allow-Private-Network", 'true')
  //       await res.header('Access-Control-Allow-Methods', '*')
  //       next();
  //   });

  //routes
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/auth", authController);
  app.use("/users", userController);
  app.use("/messages",messageController)

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
