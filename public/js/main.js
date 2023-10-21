import * as store from "./store.js";
import * as wss from "./wss.js";
import * as ui from "./ui.js";
import * as webRTCHander from "./webRTCHandler.js";
import * as constant from "./constant.js";
const socket = io("/");
wss.registerSocket(socket);

//register event

ui.getId("copy_personal_code").addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

//register event for connection button

//start chat
ui.getId("startChat").addEventListener("click", () => {
  console.log("start chat");
  const callType = constant.callType.CHAT_PERSOAN_CODE;
  const user_personal_code = ui.getId("user_personal_code").value;
  webRTCHander.sendPreOffer(callType, user_personal_code);
});

//start video call
ui.getId("startVideoCall").addEventListener("click", () => {
  console.log("start vdieo call");
  const user_personal_code = ui.getId("user_personal_code").value;
  const callType = constant.callType.VIDEO_PERSONAL_CODE;
  webRTCHander.sendPreOffer(callType, user_personal_code);
});

// register event for dialog buttons
ui.addEventListenerButtons();
