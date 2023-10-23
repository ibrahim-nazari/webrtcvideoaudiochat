import * as store from "./store.js";
import * as wss from "./wss.js";
import * as ui from "./ui.js";

const socket = io("/");
wss.registerSocket(socket);

// register event
ui.addEventListenerButtons();
