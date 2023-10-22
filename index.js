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
  connectedUsers.push(socket.id);
  socket.on("pre-offer", (data) => {
    const { callType, calleePersonalCode } = data;
    const isUserExist = connectedUsers.find(
      (userId) => userId == calleePersonalCode
    );
    if (isUserExist) {
      const data = { callerSocketId: socket.id, callType };
      socket.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      console.log("user not found");
    }
  });
  socket.on("pre-offer-answer", (data) => {
    const { callerSocketId, preOfferAnswer } = data;
    const isUserExist = connectedUsers.find(
      (userId) => userId == callerSocketId
    );
    if (isUserExist) {
      const ndata = { preOfferAnswer, socketId: socket.id };
      socket.to(callerSocketId).emit("pre-offer-answer", ndata);
    }
  });
  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;
    const isUserExist = connectedUsers.find(
      (userId) => userId == connectedUserSocketId
    );
    if (isUserExist) {
      socket.to(connectedUserSocketId).emit("webRTC-signaling", data);
    }
  });
  socket.on("disconnect", () => {
    const fConnectedUsers = connectedUsers.filter((id) => id != socket.id);
    connectedUsers = fConnectedUsers;
  });
});

server.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
