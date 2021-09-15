const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));

io.on("connection", (socket) => {
  socket.on("message", (messege) => {
    io.emit("message", messege);
  });
});

server.listen(port, () =>
  console.info(`🚀 Server Running on : http://localhost:${port}`)
);
