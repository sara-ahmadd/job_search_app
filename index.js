import express from "express";
import { DBConnection } from "./src/DB/db.connection.js";
import "./src/utils/helpers/deleteExpiredOtps.js";
import authController from "./src/modules/auth/auth.controller.js";
import morgan from "morgan";
import cors from "cors";

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use(morgan("combined"));
app.use(cors());
//DB connection
await DBConnection();

app.get("/", (req, res, next) => {
  return res.json({ message: "success!!!" });
});

app.use("/auth", authController);
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
