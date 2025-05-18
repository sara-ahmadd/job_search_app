import { ChatModel } from "../models/chat.model.js";
import { isHr } from "../utils/helpers/checkChatStart.js";

export const chatSocketService = async (socket) => {
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
};
