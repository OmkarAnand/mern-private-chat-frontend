// src/socket.js - REPLACEMENT CODE
import { io } from "socket.io-client";

let socketInstance = null; // This variable will hold our single active socket instance

export const getSocket = () => {
  // If a socket instance already exists and is connected, return it.
  // This prevents creating multiple connections.
  if (socketInstance && socketInstance.connected) {
    console.log("Returning existing connected socket instance.");
    return socketInstance;
  }

  // Retrieve the authentication token.
  // This needs to be available in localStorage after a successful login.
  const token = localStorage.getItem("token");

  // If there's no token, we cannot establish an authenticated connection.
  // Log a warning and prevent connection attempts without proper authentication.
  if (!token) {
    console.warn("No authentication token found. Socket connection attempt skipped.");
    // Returning null here allows the ChatRoom component to handle the missing socket gracefully.
    return null;
  }

  // If no socket instance exists, or the existing one is disconnected, create a new one.
  console.log("Creating a new socket instance...");
  socketInstance = io(process.env.REACT_APP_API_URL, {
    transports: ["websocket"], // Forces WebSocket transport, good for stability on deployment
    withCredentials: true, // Important for CORS and session management
    auth: {
      token: token // Sends the JWT token for backend authentication
    }
  });

  // --- Add comprehensive event listeners for debugging and state management ---

  // Listener for successful connection
  socketInstance.on('connect', () => {
    console.log('Socket connected successfully! ID:', socketInstance.id);
  });

  // Listener for disconnection
  socketInstance.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    // When disconnected, clear the instance so a new one can be created if needed later.
    socketInstance = null;
  });

  // Listener for connection errors
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    // Specifically handle authentication errors (e.g., invalid or expired token)
    if (error.message === 'Authentication error') {
      console.error('Socket authentication failed. Token might be invalid or expired.');
      // Clear local storage and potentially redirect to login to force re-authentication.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally uncomment the line below to automatically redirect on auth failure
      // window.location.href = "/";
    }
    // Clear the instance on error so a fresh connection attempt can be made.
    socketInstance = null;
  });

  return socketInstance;
};

// Export a function to explicitly disconnect the socket.
// This is crucial for cleanup when a user logs out to prevent lingering connections.
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log("Explicitly disconnecting socket instance.");
    socketInstance.disconnect();
    socketInstance = null; // Clear the instance after disconnecting
  }
};
// const socket = io(process.env.REACT_APP_API_URL, {
//   transports: ["websocket"],
//   withCredentials:true,
//   auth: {
//     token: localStorage.getItem("token") // send JWT for auth
//   }

// });
//export default socket;
