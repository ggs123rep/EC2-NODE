const express = require("express");
const http = require("http");
const cors = require("cors");
const { userJoin, getUsers, userLeave } = require("./utils/user");

const app = express();
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("HELLO MATE HOW ARE YOU");
});

// socket.io
let imageUrl, userRoom;
io.on("connection", (socket) => {
  socket.on("testJ", (data) => {
    const { roomId, userId, userName, host, presenter } = data;
    userRoom = roomId;
    const user = userJoin(socket.id, userName, roomId, host, presenter);
    const roomUsers = getUsers(user.room);
    socket.join(user.room);
   
    socket.emit("info", {
      message: "Welcome to ChatRoom",
    });
    socket.broadcast.to(user.room).emit("info", {
      message: `${user.username} has joined`,
    });

    io.to(user.room).emit("users", roomUsers);
    io.to(user.room).emit("img", imageUrl);
  });

  socket.on("given", (data) => {
    imageUrl = data;
    socket.broadcast.to(userRoom).emit("img", imageUrl);
  });

  socket.on("disconnect", () => {
    const userLeaves = userLeave(socket.id);
    const roomUsers = getUsers(userRoom);

    if (userLeaves) {
     
      io.to(userLeaves.room).emit("users", roomUsers);
    }
  });
});

// serve on port
const PORT = process.env.PORT || 4000;

server.listen(80, () =>
  console.log(`server is listening on http://localhost:${8080}`)
);
