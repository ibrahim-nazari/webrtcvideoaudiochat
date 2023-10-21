import * as wss from "./wss.js";
import * as constant from "./constant.js";
import * as ui from "./ui.js";
let connectedUserDetails;
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
  }
  if (preOfferAnswer == constant.preOfferAnswer.CALL_ACCEPTED) {
    //call accepted here
    ui.enableChat();
    ui.disableDashboard();
    ui.showCallButtons();
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

export const acceptCallHandler = () => {
  console.log("call acepted");
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
  console.log("callEnded");
  sendPreOfferAnswer(constant.preOfferAnswer.CALL_ENDED);
};
