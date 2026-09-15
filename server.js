import makeApp from "./index";
import { Server } from "socket.io";
import { connectSocket } from "./src/socket/socket.connection";
// import { DBConnection } from "./src/DB/db.connection";
import { jest } from "globals";

const port = process.env.PORT;

//DB connection
// const database = await DBConnection();
const database = jest.mock({});

const app = makeApp(database);

const server = app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
//socket initialization

const io = new Server(server, {
  cors: {
    origin: "*", // Update this with your frontend domain for security
  },
});
await connectSocket(io);
