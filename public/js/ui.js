import * as constant from "./constant.js";
import * as webRTCHander from "./webRTCHandler.js";
export const getId = (id) => document.getElementById(id);
export const updatePersonalCode = (personalCode) => {
  getId("personal_code").innerHTML = personalCode;
};

export const showIncommingCallDialog = (callType) => {
  const callTypeInfo =
    callType == constant.callType.CHAT_PERSOAN_CODE ? "Chat" : "Video";
  const title = `Incomming ${callTypeInfo} call`;
  getId("title_incomming_call").innerHTML = title;
  getId("incommingCallDialog").style.zIndex = "1000";
};

export const showDialogForCaller = () => {
  getId("callerCallDialog").style.zIndex = "1000";
};
export const removeDialog = () => {
  getId("title_incomming_call").innerHTML = "";
  getId("incommingCallDialog").style.zIndex = "-10";
  getId("callerCallDialog").style.zIndex = "-10";
  getId("infoDialog").style.zIndex = "-10";
  enableDashboard();
};

export const showInfoDialog = (preOfferAnswer) => {
  let callInfo = {};
  if (preOfferAnswer == constant.preOfferAnswer.CALLEE_NOT_FOUND) {
    callInfo = {
      title: "Callee not found",
      description: "Please check personal code",
    };
  } else if (preOfferAnswer == constant.preOfferAnswer.CALL_UNAVAILABLE) {
    callInfo = {
      title: "Callee is not available",
      description: "Please try again later",
    };
  } else if (preOfferAnswer == constant.preOfferAnswer.CALL_REJECTED) {
    callInfo = {
      title: "Callee rejected your call",
      description: "Please try again later",
    };
  } else if (preOfferAnswer == constant.preOfferAnswer.CALL_CANCELLED) {
    callInfo = {
      title: "Caller cancelled the call",
      description: "You can call user back",
    };
  } else if (preOfferAnswer == constant.preOfferAnswer.CALL_ENDED) {
    callInfo = {
      title: "User left the call",
      description: "call ended",
    };
  }

  getId("info_dialog_title").innerHTML = callInfo.title;
  getId("info_dialog_description").innerHTML = callInfo.description;
  getId("infoDialog").style.zIndex = "1000";
};
export const enableDashboard = () => {
  getId("dashboard").style.zIndex = "10";
  getId("dashboard").style.width = "400px";
  getId("dashboard").style.padding = "2.5rem";
};
export const disableDashboard = () => {
  getId("dashboard").style.zIndex = "-10";
  getId("dashboard").style.width = "0";
  getId("dashboard").style.padding = "0";
};
export const showCallButtons = () => {
  console.log("show call buttons");
  getId("call_buttons_container").style.zIndex = "10";
};

export const hideCallButtons = () => {
  getId("call_buttons_container").style.zIndex = "-10";
};

export const enableChat = () => {
  getId("form_container").style.zIndex = "10";
};
export const disableChat = () => {
  getId("form_container").style.zIndex = "-10";
};
export const addEventListenerButtons = () => {
  //register event listener for button
  getId("accept_call").addEventListener("click", () => {
    webRTCHander.acceptCallHandler();
  });
  getId("cancel_call").addEventListener("click", () => {
    webRTCHander.cancelCallHandler();
  });
  getId("reject_call").addEventListener("click", () => {
    webRTCHander.rejectCallHandler();
  });
  getId("infoDialog").addEventListener("click", () => {
    removeDialog();
  });
  getId("button_hangup").addEventListener("click", () => {
    webRTCHander.callEnded();
  });
};
