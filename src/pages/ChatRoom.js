import React, { useEffect, useState } from "react";
import socket from "../socket"; // use single shared socket instance

const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔹 When component mounts — connect and listen to events
  useEffect(() => {
    if (!socket || !user?._id) return;

    // Notify backend that this user is connected
    socket.emit("userConnected", user._id);

    // Listen for updated online users
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Listen for broadcast/public messages
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for private messages
    socket.on("receivePrivateMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("receivePrivateMessage");
    };
  }, [user?._id]);

  // 🔹 Send message to selected user
  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const msgData = {
      senderId: user._id,
      receiverId: selectedUser,
      message,
    };

    socket.emit("privateMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  // 🔹 Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ---------- Sidebar (Online Users) ---------- */}
      <div
        style={{
          width: "25%",
          borderRight: "1px solid #ccc",
          padding: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3>Online Users</h3>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {onlineUsers.length === 0 ? (
          <p>No users online</p>
        ) : (
          onlineUsers.map((id) => (
            <div
              key={id}
              style={{
                padding: "8px",
                marginBottom: "5px",
                borderRadius: "5px",
                backgroundColor:
                  selectedUser === id
                    ? "#d3f8d3"
                    : id === user._id
                    ? "#e3e3e3"
                    : "#fff",
                cursor: id === user._id ? "default" : "pointer",
              }}
              onClick={() => id !== user._id && setSelectedUser(id)}
            >
              {id === user._id ? <b>You</b> : id}
            </div>
          ))
        )}
      </div>

      {/* ---------- Chat Area ---------- */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Welcome, {user?.name}</h2>
        {selectedUser ? (
          <>
            <h4>Chatting with: {selectedUser}</h4>
            <div
              style={{
                border: "1px solid black",
                padding: "10px",
                width: "400px",
                height: "300px",
                overflowY: "auto",
                marginBottom: "10px",
              }}
            >
              {messages
                .filter(
                  (msg) =>
                    (msg.senderId === user._id &&
                      msg.receiverId === selectedUser) ||
                    (msg.senderId === selectedUser &&
                      msg.receiverId === user._id)
                )
                .map((msg, i) => (
                  <div key={i} style={{ textAlign: msg.senderId === user._id ? "right" : "left" }}>
                    <b>{msg.senderId === user._id ? "You" : msg.senderId}:</b>{" "}
                    {msg.message}
                  </div>
                ))}
            </div>

            <div>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  padding: "8px",
                  width: "300px",
                  marginRight: "10px",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <h3 style={{ color: "gray" }}>Select a user to start chatting</h3>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
