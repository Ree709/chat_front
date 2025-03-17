import "./App.css";
import { useState, useEffect, useRef } from "react";
import { Button } from "./components/ui/button.js";
import { Card, CardContent } from "./components/ui/card.js";
import { Input } from "./components/ui/input.js";

const API_URL = "http://169.234.109.212:5000";
const WS_URL = "ws://169.234.109.212:8000"; // WebSocket server address

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState(null);
  const [ws, setWs] = useState(null);
  const [chatrooms, setChatrooms] = useState(["UCI-CS", "Technology", "Sports"]);
  const [selectedRoom, setSelectedRoom] = useState("UCI-CS");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); // 未读消息计数
  const wsRef = useRef(null);

  // **User Registration**
  const register = async () => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Registration failed");
    }
  };

  // **Login & Connect to WebSocket**
  const login = async () => {
    console.log("Sending login request...");
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      console.log("Received WebSocket server:", data.websocket_server);

      // Connect to the WebSocket server
      const websocket = new WebSocket(data.websocket_server.url);

      websocket.onopen = () => {
        websocket.send(JSON.stringify({username}))
        console.log("Connected to WebSocket:", data.websocket_server);
        websocket.send(JSON.stringify({ operation: "join_chatroom", user: username, chatroom: selectedRoom }));
      };

      // **接收 WebSocket 消息**
      websocket.onmessage = (event) => {
        console.log("Received message from server:", event.data);
        try {
          const receivedData = JSON.parse(event.data);
          if (receivedData.operation === "new_message") {
            const { chatroom, message } = receivedData;
            const messageSender = message.sender ? message.sender : "Unknown";
            
            const formattedMessage = {
              user: messageSender,
              content: `${messageSender}: ${message.content}`, // 加上发送者姓名
              isSelf: messageSender === username, // 是否是自己
            };

            if (chatroom === selectedRoom) {
              // 当前聊天室收到新消息，直接更新 UI
              setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            } else {
              // 其他聊天室收到新消息，增加未读计数
              setUnreadCounts((prev) => ({
                ...prev,
                [chatroom]: (prev[chatroom] || 0) + 1,
              }));
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      websocket.onclose = () => {
        console.warn("WebSocket connection closed");
      };

      wsRef.current = websocket;
      setServer(data.websocket_server);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    }
  };

  // **Change Chatroom**
  const changeRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ operation: "join_chatroom", user: username, chatroom: room }));
    }
    // 清空未读消息计数
    setUnreadCounts((prev) => ({
      ...prev,
      [room]: 0,
    }));
  };

  // **Send Message**
  const sendMessage = () => {
    if (!message || !wsRef.current) return;

    const payload = JSON.stringify({
        operation: "client_message",
        sender: username,
        chatroom: selectedRoom,
        content: message,
      });
    console.log("Sending message:", payload);
    wsRef.current.send(payload);
    setMessage(""); // 清空输入框
  };

  return (
    <div className="container">
      {!server ? (
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="register-btn" onClick={register}>Register</Button>
          <Button className="connect-btn" onClick={login}>Connect</Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Chatroom List Section */}
          <div className="col-span-1 border-r p-4">
            <h2 className="chatroom-title">Chatrooms</h2>
            <div className="chatroom-list">
              {chatrooms.map((room) => (
                <button
                  key={room}
                  className={`chatroom-btn ${selectedRoom === room ? "active" : ""}`}
                  onClick={() => changeRoom(room)}
                >
                  {room}
                  {unreadCounts[room] > 0 && (
                    <span className="unread-count">{unreadCounts[room]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
                
          {/* Chat Window */}
          <div className="col-span-2">
            {selectedRoom ? (
              <Card>
                <CardContent className="p-4">
                  <h2 className="chatroom-title">{selectedRoom}</h2>
                  <div className="chatbox">
                  {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`message-bubble ${msg.isSelf ? "own" : "other"}`}
                      >
                        <strong>{msg.content}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Input Field and Send Button */}
                  <div className="input-area">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="message-input"
                    />
                    <Button className="send-btn" onClick={sendMessage}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p>Select a chatroom to start chatting</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

