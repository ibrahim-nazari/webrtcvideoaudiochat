import * as wss from "./wss.js";
import * as constant from "./constant.js";
import * as ui from "./ui.js";
import * as store from "./store.js";
import * as recordingHelper from "./recordhelper.js";
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
let started = false;
export const getLocalVideoPreview = (callType = null, id = null) => {
  if (started) return;
  started = false;
  navigator.mediaDevices
    .getUserMedia(defaultConstrain)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
      callType && sendPreOffer(callType, id);
      createPeerConnection();
      sendWebRTCOffer();
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
    dataChannel.onopen = () => {};
    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      ui.appendMessage(message, true);
    };
  };
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      //send our ice candidate to other user
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
  connectedUserDetails = {
    socketId: calleePersonalCode,
    callType,
  };
  let data = { callType, calleePersonalCode };
  if (callType == constant.callType.VIDEO_PERSONAL_CODE) {
  }

  ui.showDialogForCaller(callType);
  wss.sendPreOffer(data);
  store.setCallState(constant.callState.UNAVAILABLE);
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;
  const callState = store.getState().callState;
  if (callState == constant.callState.UNAVAILABLE) {
    return sendPreOfferAnswer(
      constant.preOfferAnswer.CALL_UNAVAILABLE,
      callerSocketId
    );
  }
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
  store.setCallState(constant.callState.UNAVAILABLE);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;
  ui.removeDialog();
  if (preOfferAnswer == constant.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog that callee has not found
    ui.showInfoDialog(preOfferAnswer);
    clearCall();
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog that callee is not available
    ui.showInfoDialog(preOfferAnswer);
    clearCall();
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_REJECTED) {
    // show dialog that callee reject call
    ui.showInfoDialog(preOfferAnswer);
    clearCall();
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_CANCELLED) {
    // show dialog that callee reject call
    ui.showInfoDialog(preOfferAnswer);
    clearCall();
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_ENDED) {
    // show dialog that callee reject call
    ui.showInfoDialog(preOfferAnswer);
    clearCall();
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_ACCEPTED) {
    //call accepted here
    ui.enableChat();
    ui.disableDashboard();
    ui.showCallButtons();
  }
};

const sendPreOfferAnswer = (preOfferAnswer, socketId = null) => {
  const data = {
    callerSocketId: socketId || connectedUserDetails.socketId,
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
  getLocalVideoPreview();
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_ACCEPTED);
  ui.disableDashboard();
  ui.showCallButtons();
  ui.enableChat();
};
export const rejectCallHandler = () => {
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_REJECTED);
};

export const cancelCallHandler = () => {
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_CANCELLED);
};
export const callEnded = () => {
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_ENDED);
  clearCall();
};
const clearCall = () => {
  console.log("clearcall fired");
  if (store.getState().screenSharingStream) {
    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());
  }
  if (store.getState().localStream) {
    store
      .getState()
      .localStream.getTracks()
      .forEach((track) => track.stop());
  }
  if (store.getState().remoteStream) {
    store
      .getState()
      .remoteStream.getTracks()
      .forEach((track) => track.stop());
  }
  ui.disableChat();
  ui.enableDashboard();
  ui.hideCallButtons();
  peerConnection && peerConnection.close();
  recordingHelper.stopRecording();
  connectedUserDetails = null;
  store.setCallState(constant.callState.AVAILABLE);
  setTimeout(() => {
    // store.resetState();
    started = false;
  }, 3000);
};
