import io from "socket.io-client";
import { __serverUrl__ } from "./constants";

export const socket = io(__serverUrl__, { transports: ["websocket"] });
