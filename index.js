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
let usersTalkWithStranger = [];
io.on("connection", (socket) => {
  connectedUsers.push(socket.id);
  //listen to user who just call
  socket.on("pre-offer", (data) => {
    const { callType, calleePersonalCode } = data;
    const isUserExist = connectedUsers.find(
      (userId) => userId == calleePersonalCode
    );
    //check if user exist or connected
    if (isUserExist) {
      const data = { callerSocketId: socket.id, callType };
      //send response to callee to pick the call
      socket.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      //user not
      socket.emit("user-not-found");
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

  socket.on("open-totalkwith-stranger", (status) => {
    if (status) {
      usersTalkWithStranger.push(socket.id);
    } else {
      usersTalkWithStranger = usersTalkWithStranger.filter(
        (id) => id != socket.id
      );
    }
  });

  socket.on("request-find-stranger", () => {
    // select stranger
    const lengthStrangers = usersTalkWithStranger.length;
    let calleeSocketId = null;
    if (lengthStrangers > 0) {
      const randomIndex = Math.floor(Math.random() * lengthStrangers);
      calleeSocketId = usersTalkWithStranger[randomIndex];
    }
    socket.emit("request-find-stranger", calleeSocketId);
  });

  socket.on("disconnect", () => {
    const fConnectedUsers = connectedUsers.filter((id) => id != socket.id);
    connectedUsers = fConnectedUsers;
  });
});

server.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
