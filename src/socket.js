import { io } from "socket.io-client";
export const getSocket = () => {
    // Retrieves the token just before creation, ensuring it's not null 
    // if called after successful login.
    const token = localStorage.getItem("token"); 

    return io(process.env.REACT_APP_API_URL, {
        transports: ["websocket"],
        withCredentials:true,
        auth: {
            token: token // Use the token variable
        }
    });
};
// const socket = io(process.env.REACT_APP_API_URL, {
//   transports: ["websocket"],
//   withCredentials:true,
//   auth: {
//     token: localStorage.getItem("token") // send JWT for auth
//   }

// });
//export default socket;
