const app = require("express")();
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin : "https://chat-room-using-websockets-client.vercel.app"
  }
});
app.use(bodyParser.json());

let runningSockets = [];
let roomData = [];
const roomChat = [];
const typingData = [];

io.on("connection", (socket) => {
  // Push the socket ID to the runningSockets array
  runningSockets.push(socket.id);

  io.emit("newConnection", socket.id);
  io.emit("getRunningSockets", runningSockets);

  socket.on("message", (data) => {
    const { sender, receiver, message } = data;
    socket.to(receiver).emit("message", data);
  });

  socket.on("disconnect", () => {
    // Remove the socket ID from the runningSockets array
    runningSockets = runningSockets.filter((id) => id !== socket.id);
    console.log(`USer disconnected : ${socket.id}`);
    io.emit("userDisconnected", socket.id);
    io.emit("getRunningSockets", runningSockets);
  });

  //   Create a room

  socket.on("join_room", (data) => {
    const { room, username } = data;
    const result = roomData.find((item) => {
      return item.room === room && item.username === username;
    });
    if (!result) {
      socket.join(room);
      io.in(room).emit("createRoom", { username, room });
      roomData.push({ room, username });
    } else {
      socket.emit("already_in_room", { username, room });
      console.log("User already in room : ", username);
    }
  });

  socket.on("leave_room", (data) => {
    const { room, username } = data;
    console.log("Leave");
    const result = roomData.find((item) => {
      return item.room === room && item.username === username;
    });
    if (result) {
      socket.leave(room);
      // Notify all users in the room that the user is leaving
      io.in(room).emit("leaveRoom", { username, room });

      // Remove the user from the roomData array
      roomData = roomData.filter(
        (item) => !(item.room === room && item.username === username)
      );

      console.log(`Successfully left: ${username} from room ${room}`);
    }
  });

  //   Message in room
  socket.on("message_in_room", (data) => {
    const { username, message, room } = data;
    const result = roomData.find((item) => {
      return item.username === username && item.room === room;
    });

    if (result) {
      io.in(room).emit("room_message", { username, message, room });
    } else {
      console.log(`User not joined in group : ${username}`);
    }
  });

  socket.on("typing", (data) => {
    const { username, room } = data;
    console.log(data);
    const result = roomData.find((item) => {
      return item.username === username && item.room === room;
    });

    if (result) {
      io.in(data.room).emit("show_typing", data);
      console.log(`${username} is typing`);
    }
  });
  socket.on("typing_leave", (data) => {
    const { username, room } = data;
    const result = roomData.find((item) => {
      return item.username === username && item.room === room;
    });

    if (result) {
      io.in(data.room).emit("hide_typing", data);
      console.log(`${username} is typing`);
    }
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
