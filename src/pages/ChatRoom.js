// src/pages/ChatRoom.js - MODIFIED CODE
import React, { useEffect, useState } from "react";
// Import both getSocket and the new disconnectSocket
import { getSocket, disconnectSocket } from "../socket";
import API from "../api/api";

const ChatRoom = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  // currentSocket state to hold the *connected* socket instance for this component
  const [currentSocket, setCurrentSocket] = useState(null);

  // 🔹 Fetch all users (no changes)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setAllUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Socket connection and listeners
  useEffect(() => {
    // Prevent socket connection if user ID is not available (e.g., not logged in)
    if (!user?._id) {
      console.warn("User ID not available, skipping socket connection attempt.");
      // If a socket was previously connected, disconnect it if the user is no longer valid.
      if (currentSocket) {
          disconnectSocket(); // Use the global disconnect
          setCurrentSocket(null);
      }
      return;
    }

    // Attempt to get the shared socket instance
    const socket = getSocket();

    // If getSocket returns null (e.g., no token), handle it gracefully
    if (!socket) {
      console.error("Socket instance could not be obtained (likely due to missing token).");
      // You might want to redirect to login here if the token issue isn't handled by getSocket already
      // if (!localStorage.getItem("token")) window.location.href = "/";
      return;
    }

    setCurrentSocket(socket); // Store the obtained socket instance in component state

    // --- Add event listeners to the socket, ensuring they are not duplicated ---
    // The `hasListeners` check helps prevent adding the same listener multiple times
    // if the useEffect runs again but the socket instance is the same.
    if (!socket.hasListeners('onlineUsers')) {
        socket.on("onlineUsers", (users) => {
            console.log("Received online users event:", users);
            // Filter out the current user from the online list for display, if desired, or just set
            setOnlineUsers(users);
        });
    }

    if (!socket.hasListeners('receivePrivateMessage')) {
        socket.on("receivePrivateMessage", (data) => {
            console.log("Received private message event:", data);
            setMessages(prev => [...prev, data]);
        });
    }

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      console.log("ChatRoom component cleanup: Removing socket listeners.");
      if (socket) {
          socket.off("onlineUsers");
          socket.off("receivePrivateMessage");
          // IMPORTANT: Do NOT call disconnectSocket() here unless you want the socket
          // to disconnect *every time* ChatRoom unmounts (e.g., navigating away briefly).
          // The singleton pattern means the socket stays alive until explicitly disconnected (like on logout).
      }
    };
  }, [user?._id]); // Dependency array: rerun effect if user ID changes. currentSocket removed as dependency to prevent infinite loops.

  // 🔹 Send message
  const sendMessage = () => {
    // Add checks for a connected socket before attempting to emit
    if (!message.trim() || !selectedUser || !currentSocket || !currentSocket.connected) {
        console.warn("Cannot send message: Message empty, no user selected, or socket not connected.");
        return;
    }

    const msgData = {
      senderId: user._id,
      receiverId: selectedUser,
      message
    };

    currentSocket.emit("privateMessage", msgData);
    setMessages(prev => [...prev, msgData]);
    setMessage("");
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    disconnectSocket(); // Explicitly disconnect the shared socket on logout
    window.location.href = "/"; // Redirect to login page
  };

  // ... (rest of your getUserName helper and JSX render logic remains the same)
};

export default ChatRoom;