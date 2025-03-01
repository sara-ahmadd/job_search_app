import express from "express";
import { DBConnection } from "./src/DB/db.connection.js";
import "./src/utils/helpers/deleteExpiredOtps.js";
import authController from "./src/modules/auth/auth.controller.js";
import companyController from "./src/modules/company/company.controller.js";
import userController from "./src/modules/user/user.controller.js";
import jobController from "./src/modules/job/job.controller.js";
import morgan from "morgan";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./src/app.graphql.js";
import applicationController from "./src/modules/application/application.controller.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(morgan("combined"));
app.use(cors());

//DB connection
await DBConnection();

//api to test deployment
app.get("/", (req, res, next) => {
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
app.use((error, req, res, next) => {
  const status = error.cause || 500;
  return res
    .status(status)
    .json({ status: "Error", error: error.message, stack: error.stack });
});

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
