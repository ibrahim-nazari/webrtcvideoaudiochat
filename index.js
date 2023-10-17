const express = require("express");
const http = require("http");
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
let connectedUsers = [];
io.on("connection", (socket) => {
  console.log(" user connected to socket socket.id", socket.id);
  connectedUsers.push(socket.id);
  socket.on("disconnect", () => {
    const fConnectedUsers = connectedUsers.filter((id) => id != socket.id);
    connectedUsers = fConnectedUsers;
  });
});

server.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
