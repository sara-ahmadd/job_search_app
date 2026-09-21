import makeApp from "./index";
import { Server } from "socket.io";
import { connectSocket } from "./src/socket/socket.connection";
import { DBConnection } from "./src/DB/db.connection";
import { setIO } from "./src/socket/socket.instance.js";

const port = process.env.PORT;

//DB connection
await DBConnection();

const app = await makeApp();

const server = app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
//socket initialization

export const io = new Server(server, {
  cors: {
    origin: "*", // Update this with your frontend domain for security
  },
});
setIO(io);
await connectSocket(io);
