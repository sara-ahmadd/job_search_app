import cors from "cors";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import morgan from "morgan";
import { schema } from "./src/app.graphql.js";
import { DBConnection } from "./src/DB/db.connection.js";
import applicationController from "./src/modules/application/application.controller.js";
import authController from "./src/modules/auth/auth.controller.js";
import companyController from "./src/modules/company/company.controller.js";
import jobController from "./src/modules/job/job.controller.js";
import userController from "./src/modules/user/user.controller.js";
import "./src/utils/helpers/deleteExpiredOtps.js";
import { Server } from "socket.io";
import { decode } from "jsonwebtoken";
import { UserModel } from "./src/models/user.model.js";
import { verifyToken } from "./src/utils/token/token.js";
import { authenticateUser } from "./src/socket/middlewares/authenticateUser.js";
import { checkCompanyById } from "./src/utils/helpers/checkCompany.js";
import { ChatModel } from "./src/models/chat.model.js";
import { isHr } from "./src/utils/helpers/checkChatStart.js";
import rateLimit from "express-rate-limit";
import { connectSocket } from "./src/socket/socket.connection.js";

const app = express();
const port = process.env.PORT;

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

const server = app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});

//socket initialization

export const io = new Server(server, {
  cors: {
    origin: "*", // Update this with your frontend domain for security
  },
});
await connectSocket(io);

export default app;
