// socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = async () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;


