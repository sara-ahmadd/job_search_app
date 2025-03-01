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

//authenticate current logged in user and add his name & id to socket object
io.use(authenticateUser);

//after connection with socket, emit the start-conversation event between the currently logged-in user
// and the receiver user, so i need the company which this user belongs to,
// to checkif he is the company owner or from hrs
io.on("connection", async (socket) => {
  socket.on("start_conversation", async ({ companyId }) => {
    console.log("🚀 Received start_conversation for company:", companyId);
    await isHr(companyId, socket);
  });

  //get the message and the id of the receiver user
  socket.on("sendMessage", async ({ to, message, companyId }) => {
    let chat = await ChatModel.findOne({
      $or: [
        { senderId: socket.userId, receiverId: to },
        { senderId: to, receiverId: socket.userId },
      ],
    });

    if (!chat) {
      await isHr(companyId, socket);
      // If chat doesn't exist, create a new one
      chat = await ChatModel.create({
        senderId: socket.userId,
        receiverId: to,
        messages: [{ senderId: socket.userId, message }],
      });
    } else {
      chat = await ChatModel.findOneAndUpdate(
        { _id: chat._id },
        { $push: { messages: { senderId: socket.userId, message } } },
        { new: true } // return updated document
      );
    }
    console.log(chat);
    socket.emit("sendMessage", { from: socket.userName, message });
  });

  //on firing it from frontend, emit event that gets all chat history between current user and other one
  socket.on("get_history", async ({ to }) => {
    let chatHistory = await ChatModel.findOne({
      $or: [
        { senderId: socket.userId, receiverId: to },
        { senderId: to, receiverId: socket.userId },
      ],
    }).populate([
      {
        path: "senderId",
        select: "firstName lastName profilePic coverPick email",
      },
      {
        path: "receiverId",
        select: "firstName lastName profilePic coverPick email",
      },
    ]);
    socket.emit("get_history", { data: chatHistory });
  });
  console.log("Frontend connected successfully");
});
export default app;
