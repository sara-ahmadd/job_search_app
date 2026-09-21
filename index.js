import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { createHandler } from "graphql-http/lib/use/express";
import morgan from "morgan";

import { schema } from "./src/app.graphql.js";
import applicationController from "./src/modules/application/application.controller.js";
import authController from "./src/modules/auth/auth.controller.js";
import companyController from "./src/modules/company/company.controller.js";
import jobController from "./src/modules/job/job.controller.js";
import userController from "./src/modules/user/user.controller.js";
import "./src/utils/helpers/deleteExpiredOtps.js";

export default async function app() {
  const app = express();

  app.use(express.json());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

  // Apply the rate limiting middleware to all requests.
  app.use(limiter);
  app.use(morgan("combined"));
  app.use(cors());

  app.get("/", (req, res) => {
    res.json({
      message: "Hello",
    });
  });
  //api to test deployment
  app.get("/", (ـreq, res) => {
    return res.json({ message: "success!!!" });
  });

  app.use("/graphql", createHandler({ schema }));
  app.use("/auth", authController);
  app.use("/company", companyController);
  app.use("/user", userController);
  app.use("/job", jobController);
  app.use("/application", applicationController);

  //handle wrong api calls
  app.all("*", (req, res, next) => {
    return next(new Error("API not found!"));
  });

  //global error handler
  app.use((error, req, res) => {
    const status = error.cause || 500;
    return res
      .status(status)
      .json({ status: "Error", error: error.message, stack: error.stack });
  });

  return app;
}
