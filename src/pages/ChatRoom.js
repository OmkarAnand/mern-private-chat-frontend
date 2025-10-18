import React, { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/api"; // axios instance

const ChatRoom = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [allUsers, setAllUsers] = useState([]); // all users from DB
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // 🔹 Fetch all users
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

  // 🔹 Socket listeners
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("userConnected", user._id);

    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    socket.on("receivePrivateMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receivePrivateMessage");
    };
  }, [user?._id]);

  // 🔹 Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const msgData = {
      senderId: user._id,
      receiverId: selectedUser,
      message
    };

    socket.emit("privateMessage", msgData);
    setMessages(prev => [...prev, msgData]);
    setMessage("");
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // 🔹 Helper to get name by ID
  const getUserName = (id) => {
    if (id === user._id) return "You";
    const u = allUsers.find(u => u._id === id);
    return u ? u.name : id;
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "25%", borderRight: "1px solid #ccc", padding: "10px", background: "#f9f9f9" }}>
        <h3>Online Users</h3>
        {onlineUsers.length === 0 && <p>No users online</p>}
        {onlineUsers.map(id => (
          <div
            key={id}
            style={{ padding: "5px", cursor: "pointer", backgroundColor: selectedUser === id ? "#d3f8d3" : "transparent" }}
            onClick={() => setSelectedUser(id)}
          >
            {getUserName(id)}
          </div>
        ))}
        <button style={{ marginTop: "20px", background: "red", color: "#fff" }} onClick={handleLogout}>Logout</button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, textAlign: "center", marginTop: "20px" }}>
        <h2>Welcome, {user?.name}</h2>
        <div style={{ border: "1px solid black", width: "400px", margin: "auto", height: "300px", overflowY: "scroll", padding: "10px" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <b>{getUserName(msg.senderId)}:</b> {msg.message}
            </div>
          ))}
        </div>
        <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
