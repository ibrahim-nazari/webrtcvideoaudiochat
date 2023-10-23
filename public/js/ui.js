import * as constant from "./constant.js";
import * as webRTCHander from "./webRTCHandler.js";
import * as store from "./store.js";
import * as recordingHelper from "./recordhelper.js";
import * as wss from "./wss.js";
export const getId = (id) => document.getElementById(id);

export const updateLocalVideo = (stream) => {
  getId("local_video").srcObject = stream;
};
export const updateRemoteStream = (stream) => {
  getId("remote_video").srcObject = stream;
};
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
  } else if (preOfferAnswer == constant.preOfferAnswer.NO_STRANGER_FOUND) {
    callInfo = {
      title: "No one found",
      description: "Try again latter",
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
  getId("message__container").innerHTML = "";
};
const micOffImgSrc = "/utils/images/micOff.png";
const micOnImgSrc = "/utils/images/mic.png";
export const updateMicButton = (micActive) => {
  getId("mic_button_img").src = micActive ? micOffImgSrc : micOnImgSrc;
};
const cameraOffIcon = "/utils/images/cameraOff.png";
const cameraOnIcon = "/utils/images/camera.png";
export const updateCameraButton = (videActive) => {
  getId("camera_button_img").src = videActive ? cameraOffIcon : cameraOnIcon;
};

export const appendMessage = (message, left) => {
  const div = document.createElement("div");
  div.className = left
    ? "bg-gray-500 p-2 px-3 rounded-md text-start  mr-auto w-fit my-1"
    : "bg-blue-600 p-2 px-3 rounded-md text-end w-fit  ml-auto my-1";
  div.innerText = message;
  getId("message__container").appendChild(div);
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
  getId("local_video").addEventListener("loadedmetadata", () => {
    getId("local_video").play();
  });
  getId("remote_video").addEventListener("loadedmetadata", () => {
    getId("remote_video").play();
  });
  getId("mic_button").addEventListener("click", () => {
    const localStream = store.getState().localStream;
    const audioActive = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !audioActive;
    updateMicButton(audioActive);
  });
  getId("camera_button").addEventListener("click", () => {
    const localStream = store.getState().localStream;
    const cameraActive = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraActive;
    updateCameraButton(cameraActive);
  });
  getId("recording_button").addEventListener("click", () => {
    recordingHelper.startRecording();
    getId("recording_button").classList.add("hidden");
    getId("stop_recording_button").style.zIndex = "10";
    getId("pause_resume_button").style.zIndex = "10";
    getId("pause_resume_button").innerText = "Pause recording";
  });
  getId("stop_recording_button").addEventListener("click", () => {
    recordingHelper.stopRecording();
  });
  getId("pause_resume_button").addEventListener("click", () => {
    const isPaused =
      getId("pause_resume_button").innerText == "Resume recording"
        ? true
        : false;
    if (isPaused) {
      recordingHelper.resumeRecording();
      getId("pause_resume_button").innerText = "Pause recording";
    } else {
      recordingHelper.pauseRecording();
      getId("pause_resume_button").innerText = "Resume recording";
    }
  });
  getId("sharescreen_button").addEventListener("click", () => {
    webRTCHander.switchToScreenShare();
  });
  getId("send_message_button").addEventListener("click", (e) => {
    e.preventDefault();
    const message = getId("message").value;
    webRTCHander.sendMessageUsingDataChannel(message);
    getId("message").value = "";
  });
  getId("message").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      console.log("entered");
      webRTCHander.sendMessageUsingDataChannel(e.target.value);
      getId("message").value = "";
    }
  });
  getId("sharescreen_button").addEventListener("click", () => {
    webRTCHander.switchToScreenShare();
  });
  getId("allow_stranger_button").addEventListener("change", (e) => {
    console.log(e.target.checked);
    store.setOpenToTakWithStranger(e.target.checked);
    wss.sendDataOpenToTalkWithStranger(e.target.checked);
  });
  getId("chat_stranger_button").addEventListener("click", (e) => {
    const callType = constant.callType.CHAT_PERSOAN_CODE;
    store.setCallType(callType);
    wss.requestFindStranger();
  });
  getId("video_stranger_button").addEventListener("click", (e) => {
    const callType = constant.callType.VIDEO_PERSONAL_CODE;
    store.setCallType(callType);
    wss.requestFindStranger();
  });
  //start chat
  getId("startChat").addEventListener("click", () => {
    console.log("start chat");
    const callType = constant.callType.CHAT_PERSOAN_CODE;
    const user_personal_code = getId("user_personal_code").value;
    webRTCHander.sendPreOffer(callType, user_personal_code);
  });

  //start video call
  getId("startVideoCall").addEventListener("click", () => {
    const user_personal_code = getId("user_personal_code").value;
    const callType = constant.callType.VIDEO_PERSONAL_CODE;
    webRTCHander.getLocalVideoPreview(callType, user_personal_code);
  });

  getId("copy_personal_code").addEventListener("click", () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
  });
};
