import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import Filter from "bad-words";
import generateMsg from "./utils/messages.js";
import { getUserInRoom, addUser, removeUser, getUser } from "./utils/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

// let count = 0;

// io.on("connection", (socket) => {
//   // console.log("New web socket ");
//   // socket.emit("countUpdated", count);
//   socket.on("increment", () => {
//     count++;
//     // socket.emit("countUpdated", count);//emit for single connection
//     io.emit("countUpdated", count);//emit for multiple connection

//   });
// });

io.on("connection", (socket) => {
  // socket.emit("message", generateMsg("Welcome"));
  // socket.broadcast.emit("message", "Welcome new user"); //when want to send a message to everyone the client joins itself

  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.broadcast
      .to(user.room)
      .emit("message", generateMsg(`${user.username} has joined`, "Admin"));

    io.to(user.room).emit("roomData", {
      room: user.username,
      users: getUserInRoom(user.room),
    });
    callback();
  });

  socket.on("send", (data, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);
    if (filter.isProfane(data)) {
      return callback("Bad words not allowed");
    }
    if (user)
      io.to(user.room).emit("message", generateMsg(data, user.username));
    callback();
  });
  socket.on("send-location", (data, callback) => {
    const user = getUser(socket.id);
    if (user)
      io.to(user.room).emit(
        "location",
        generateMsg(
          `https://google.com/maps?q=${data.latitude},${data.longitude}`,
          user.username
        )
      );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMsg(`${user.username} has left`, "Admin")
      );
      io.to(user.room).emit("roomData", {
        room: user.username,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
