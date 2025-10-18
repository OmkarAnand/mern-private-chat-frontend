import { io } from "socket.io-client";

// connect to your deployed backend
const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket"], // ensures stable connection
});

export default socket;
