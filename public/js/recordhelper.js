import * as store from "./store.js";
import * as ui from "./ui.js";
let mediaRecorder;
const vp9 = "video/webm; codecs=vp=9";
const vp9codecs = { mineType: vp9 };
const recordedChunk = [];
export const startRecording = () => {
  const remoteStream = store.getState().remoteStream;
  if (MediaRecorder.isTypeSupported(vp9codecs)) {
    mediaRecorder = new MediaRecorder(remoteStream, vp9codecs);
  } else {
    mediaRecorder = new MediaRecorder(remoteStream);
  }
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunk.push(event.data);
  }
  downloadRecordedVideo();
};

export const pauseRecording = () => {
  mediaRecorder.pause();
};
export const resumeRecording = () => {
  mediaRecorder.resume();
};

export const stopRecording = () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  ui.getId("stop_recording_button").style.zIndex = "-10";
  ui.getId("recording_button").classList.remove("hidden");
  ui.getId("pause_resume_button").style.zIndex = "-10";
};

const downloadRecordedVideo = () => {
  const blob = new Blob(recordedChunk, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recording.webm";
  document.body.appendChild(a);
  a.style = "display:none";
  a.click();
  window.URL.revokeObjectURL(url);
};
