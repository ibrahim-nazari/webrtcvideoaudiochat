import * as constant from "./constant.js";

let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingStream: null,
  allowConnectionsFromStranger: false,
  screenSharingActive: false,
  callState: constant.callState.AVAILABLE,
  openToTalkWidthStranger: false,
  callType: null,
};

export const setSocketId = (socketId) => {
  state = { ...state, socketId };
};
export const setLocalStream = (localStream) => {
  state = { ...state, localStream };
};
export const setRemoteStream = (remoteStream) => {
  state = { ...state, remoteStream };
};
export const setScreenSharingStream = (screenSharingStream) => {
  state = { ...state, screenSharingStream };
};
export const setScreenSharingActive = (screenSharingActive) => {
  state = { ...state, screenSharingActive };
};
export const setAllowConnectionsFromStranger = (
  allowConnectionsFromStranger
) => {
  state = { ...state, allowConnectionsFromStranger };
};
export const setCallState = (callState) => {
  state = { ...state, callState };
};
export const setOpenToTakWithStranger = (status) => {
  state = { ...state, openToTalkWidthStranger: status };
};
export const setCallType = (type) => {
  state = { ...state, callType: type };
};
export const resetState = () => {
  state = {
    ...state,
    localStream: null,
    remoteStream: null,
    screenSharingStream: null,
    allowConnectionsFromStranger: false,
    screenSharingActive: false,
    callState: null,
  };
};
export const getState = () => {
  return state;
};
