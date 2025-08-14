// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false, // wait to connect manually
});

export default socket;
