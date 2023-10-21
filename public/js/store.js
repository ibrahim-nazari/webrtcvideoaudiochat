let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingStream: null,
  allowConnectionsFromStranger: false,
  screenSharingActive: false,
  callState: null,
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
export const getState = () => {
  return state;
};
