import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket"],
  withCredentials:true,
  auth: {
    token: localStorage.getItem("token") // send JWT for auth
  }

});

export default socket;
