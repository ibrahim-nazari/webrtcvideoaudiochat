import * as ui from "./ui.js";
import * as store from "./store.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constant from "./constant.js";
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
    socketIo.on("webRTC-signaling", (data) => {
      switch (data.type) {
        case constant.webRTCsignaling.OFFER:
          webRTCHandler.handleWebRTCOffer(data);
          break;
        case constant.webRTCsignaling.ANSWER:
          webRTCHandler.handleWebRTCAnswer(data);
          break;
        case constant.webRTCsignaling.ICE_CANDIATE:
          webRTCHandler.handleWebRTCCandidate(data);
          break;
        default:
          return;
      }
    });
    socketIo.on("request-find-stranger", (id) => {
      if (id) {
        const callType = store.getState().callType;
        webRTCHandler.getLocalVideoPreview(callType, id);
      } else {
        ui.showInfoDialog(constant.preOfferAnswer.NO_STRANGER_FOUND);
      }
    });
    socketIo.on("user-not-found", (id) => {
      ui.showInfoDialog(constant.preOfferAnswer.CALLEE_NOT_FOUND);
    });
  });
};

export const sendPreOffer = (data) => {
  socketIo.emit("pre-offer", data);
};
export const requestFindStranger = () => {
  socketIo.emit("request-find-stranger");
};

export const sendPreOfferAnswer = (data) => {
  socketIo.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIo.emit("webRTC-signaling", data);
};

export const sendDataOpenToTalkWithStranger = (status) => {
  socketIo.emit("open-totalkwith-stranger", status);
};
