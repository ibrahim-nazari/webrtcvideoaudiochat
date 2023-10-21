import * as ui from "./ui.js";
import * as store from "./store.js";
import * as webRTCHandler from "./webRTCHandler.js";
let socketIo = null;

export const registerSocket = (socket) => {
  socket.on("connect", () => {
    socketIo = socket;
    console.log("successfully connected to socket.io  server");
    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id);

    socketIo.on("pre-offer", (data) => {
      webRTCHandler.handlePreOffer(data);
    });
    socketIo.on("pre-offer-answer", (data) => {
      webRTCHandler.handlePreOfferAnswer(data);
    });
  });
};

export const sendPreOffer = (data) => {
  socketIo.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIo.emit("pre-offer-answer", data);
};
