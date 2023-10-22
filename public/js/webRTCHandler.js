import * as wss from "./wss.js";
import * as constant from "./constant.js";
import * as ui from "./ui.js";
import * as store from "./store.js";
let connectedUserDetails;
let dataChannel;
const defaultConstrain = {
  audio: true,
  video: true,
};
const configuration = {
  iceServers: [
    {
      urls: "stun:stun.1.google.com:13902",
    },
  ],
};
let peerConnection;
export const getLocalVideoPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstrain)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
    })
    .catch((error) => {
      console.log("error", error);
    });
};
export const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);
  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;
    dataChannel.onopen = () => {
      console.log("peer connection is ready to recieve message");
    };
    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("message ----", message);
      ui.appendMessage(message, true);
    };
  };
  peerConnection.onicecandidate = (event) => {
    console.log("getting ice candiate ");
    if (event.candidate) {
      //send our ice candidate to other user
      console.log("send ice candidate", event.candidate);
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constant.webRTCsignaling.ICE_CANDIATE,
        candidate: event.candidate,
      });
    }
  };
  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState == "connected") {
      console.log("successfully connected to peer");
    }
  };
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteStream(remoteStream);
  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  //add our stream to peer connection
  if (connectedUserDetails.callType == constant.callType.VIDEO_PERSONAL_CODE) {
    const localStream = store.getState().localStream;
    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};
export const sendPreOffer = (callType, calleePersonalCode) => {
  const data = { callType, calleePersonalCode };

  connectedUserDetails = {
    socketId: calleePersonalCode,
    callType,
  };

  if (
    callType == constant.callType.CHAT_PERSOAN_CODE ||
    callType == constant.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showDialogForCaller(callType);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;
  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };
  if (
    callType == constant.callType.CHAT_PERSOAN_CODE ||
    callType == constant.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncommingCallDialog(callType);
  }
};
export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;
  console.log("webrtc pre-offer anser", data);
  ui.removeDialog();
  if (preOfferAnswer == constant.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog that callee has not found
    ui.showInfoDialog(preOfferAnswer);
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog that callee is not available
    ui.showInfoDialog(preOfferAnswer);
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_REJECTED) {
    // show dialog that callee reject call
    ui.showInfoDialog(preOfferAnswer);
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_CANCELLED) {
    // show dialog that callee reject call
    ui.showInfoDialog(preOfferAnswer);
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_ENDED) {
    // show dialog that callee reject call
    ui.showInfoDialog(preOfferAnswer);
    ui.disableChat();
    ui.enableDashboard();
    ui.hideCallButtons();
    peerConnection.close();
    store.setLocalStream(null);
    store.setRemoteStream(null);
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_ACCEPTED) {
    //call accepted here
    ui.enableChat();
    ui.disableDashboard();
    ui.showCallButtons();
    createPeerConnection();
    sendWebRTCOffer();
  }
};

const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };
  ui.removeDialog();
  wss.sendPreOfferAnswer(data);
};

export const handleWebRTCOffer = async (data) => {
  try {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
      connectedUserSocketId: connectedUserDetails.socketId,
      type: constant.webRTCsignaling.ANSWER,
      answer,
    });
  } catch (error) {
    console.log("error when handle webrtc offer");
  }
};
export const handleWebRTCAnswer = async (data) => {
  await peerConnection.setRemoteDescription(data.answer);
};
export const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constant.webRTCsignaling.OFFER,
    offer,
  });
};
export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (error) {
    console.log("error when trying to get ice candidate");
  }
};
let screenSharingStream;
export const switchToScreenShare = async () => {
  const screenSharingActive = store.getState().screenSharingActive;
  if (screenSharingActive) {
    const localStream = store.getState().localStream;
    const senders = peerConnection.getSenders();
    const sender = senders.find(
      (sender) =>
        sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
    );
    if (sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }
    //stop sharing screen
    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());
    store.setScreenSharingActive(!screenSharingActive);
    ui.updateLocalVideo(localStream);
  } else {
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.setScreenSharingStream(screenSharingStream);
      const senders = peerConnection.getSenders();
      const sender = senders.find(
        (sender) =>
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
      );
      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }
      store.setScreenSharingActive(!screenSharingActive);
      ui.updateLocalVideo(screenSharingStream);
    } catch (error) {
      console.log("screen sharing switching error", error);
    }
  }
};

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
  ui.appendMessage(message, false);
};
export const acceptCallHandler = () => {
  createPeerConnection();
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_ACCEPTED);
  ui.disableDashboard();
  ui.showCallButtons();
  ui.enableChat();
};
export const rejectCallHandler = () => {
  console.log("call rejected");
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_REJECTED);
};

export const cancelCallHandler = () => {
  console.log("cancel call");
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_CANCELLED);
};
export const callEnded = () => {
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_ENDED);
  peerConnection.close();
  store.setLocalStream(null);
  store.setRemoteStream(null);
  ui.disableChat();
  ui.enableDashboard();
  ui.hideCallButtons();
};
