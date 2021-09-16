const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./helpers/users");
const port = 5555;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));

io.on("connection", (socket) => {
  let state = false;
  let stateLight = false;
  console.log(`connect ${socket.id}`);
  socket.on("join", ({ room, device = false }) => {
    const user = userJoin(socket.id, room, device);
    socket.join(room);
    const getUsers = getRoomUsers(user.room);
    if (device) state = true;
    io.to(user.room).emit("deviceStatus", state);
    io.to(user.room).emit("light", stateLight);
  });

  socket.on("message", (messege) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", messege);
  });

  socket.on("light", (state) => {
    stateLight = state;
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("light", stateLight);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    console.log(user);
    if (user) {
      user.device && socket.broadcast.to(user.room).emit("deviceStatus", false);
    }
  });
});

server.listen(port, () =>
  console.info(`🚀 Server Running on : http://localhost:${port}`)
);
