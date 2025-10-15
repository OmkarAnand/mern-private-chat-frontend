import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const ChatRoom = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    newSocket.emit("userConnected", user._id);

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => newSocket.disconnect();
  }, [user._id]);

  const sendMessage = () => {
  if (message.trim()) {
    const msgData = {
      senderId: user._id,
      receiverId: selectedUser,
      message,
    };

    socket.emit("privateMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  }
};

// To receive private messages
useEffect(() => {
  if (socket) {
    socket.on("receivePrivateMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }
}, [socket]);
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};


  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar for online users */}
      <div
        style={{
          width: "25%",
          borderRight: "1px solid #ccc",
          padding: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>Online Users</h3>
        {onlineUsers.map((id) => (
  <div
    key={id}
    style={{
      padding: "5px 0",
      cursor: "pointer",
      backgroundColor: selectedUser === id ? "#d3f8d3" : "transparent",
    }}
    onClick={() => setSelectedUser(id)}
  >
    {id === user._id ? <b>You</b> : id}
  </div>
))}
<button
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "red",
    color: "white",
  }}
  onClick={handleLogout}
>
  Logout
</button>


      </div>

      {/* Chat area */}
      <div style={{ flex: 1, textAlign: "center", marginTop: "20px" }}>
        <h2>Welcome, {user?.name}</h2>
        <div
          style={{
            border: "1px solid black",
            padding: "10px",
            width: "400px",
            margin: "auto",
            height: "300px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, i) => (
            <div key={i}>
              <b>{msg.user}:</b> {msg.message}
            </div>
          ))}
        </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
