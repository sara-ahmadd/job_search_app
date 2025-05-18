import { chatSocketService } from "./chat.socket.js";
import { authenticateUser } from "./middlewares/authenticateUser.js";

export const connectSocket = async (io) => {
  //authenticate current logged in user and add his name & id to socket object
  io.use(authenticateUser);

  //after connection with socket, emit the start-conversation event between the currently logged-in user
  // and the receiver user, so i need the company which this user belongs to,
  // to checkif he is the company owner or from hrs
  io.on("connection", async (socket) => {
    await chatSocketService(socket);
    console.log("Frontend connected successfully");
  });
};
