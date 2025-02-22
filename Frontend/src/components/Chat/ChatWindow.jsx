import React, { useState, useEffect, useRef } from "react";
import { X, Minimize2, Maximize2, Send } from "lucide-react";
import { useSelector } from "react-redux";

const ChatWindow = ({ user, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef();
  const socketRef = useRef(null);
  const currentUser = useSelector((state) => state.userAuth.user || state.workshopAuth.workshop);

  useEffect(() => {
    if (!user || !currentUser) return;

    const connectWebSocket = () => {
      const participants = [currentUser.id, user.id].sort();
      const roomName = `${participants[0]}_${participants[1]}`;
      const token = localStorage.getItem("token") || localStorage.getItem("workshopToken");
      
      const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${token}`);

      ws.onopen = () => {
        console.log("WebSocket connected:", roomName);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket data:", data);

        if (data.type === "chat_history") {
          const sortedMessages = data.messages.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);
        } else if (data.type === "chat_message") {
          setMessages(prev => [...prev, {
            message_id: data.message_id,
            content: data.message,
            sender_id: currentUser.id,
            sender_name: data.sender,
            timestamp: data.timestamp
          }]);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      socketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user, currentUser]);

  useEffect(() => {
    if (chatRef.current && !isMinimized) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("Cannot send message: Socket not ready or message empty");
      return;
    }

    const messageData = {
      type: "chat_message",
      message: message.trim(),
      receiver: user.id,
    };

    try {
      socketRef.current.send(JSON.stringify(messageData));
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg mb-1">
      <div className="flex items-center justify-between p-3 bg-black text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <img
            src={user.document || "/default-avatar.png"}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold">{user.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-gray-700 p-1 rounded"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="h-64 p-3 overflow-y-auto bg-gray-50" ref={chatRef}>
            {messages.map((msg, index) => (
              <div
                key={`${msg.timestamp}-${index}`}
                className={`p-2 mb-2 rounded-lg ${
                  msg.sender_id === currentUser.id
                    ? "ml-auto bg-blue-500 text-white max-w-[80%]"
                    : "mr-auto bg-gray-200 text-gray-800 max-w-[80%]"
                }`}
              >
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex items-center p-3 border-t border-gray-300">
            <input
              type="text"
              placeholder={isConnected ? "Write a message..." : "Connecting..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isConnected}
            />
            <button
              type="submit"
              className={`ml-2 transition duration-200 ${
                isConnected && message.trim() 
                  ? "text-black hover:text-gray-700" 
                  : "text-gray-400 cursor-not-allowed"
              }`}
              disabled={!isConnected || !message.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;