import React, { useState, useRef, useEffect } from "react";
import { IoClose, IoSend } from "react-icons/io5";

const WorkshopChatModal = ({ isOpen, onClose, roomName, baseUrl }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const handleInputChange = (e) => setInputMessage(e.target.value);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("workshopToken"); // Get workshop token
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${baseUrl}/ws/chat/${roomName}/?token=${token}`);
      
      console.log(`Connecting to WebSocket at: ${protocol}://${baseUrl}${roomName}/`);
      setSocket(ws);

      ws.onopen = () => console.log("✅ Workshop WebSocket connection established.");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.message, sender: data.sender },
        ]);
      };
      ws.onerror = (error) => console.error("❌ WebSocket error:", error);
      ws.onclose = () => console.log("🔌 WebSocket connection closed.");

      return () => {
        ws.close(); // Close WebSocket when modal closes
      };
    }
  }, [isOpen, roomName, baseUrl]);

  const waitForSocketConnection = (socketInstance, callback) => {
    const maxAttempts = 10;
    let attempts = 0;

    const interval = setInterval(() => {
      if (socketInstance.readyState === WebSocket.OPEN) {
        clearInterval(interval);
        callback();
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error("WebSocket connection failed. Cannot send message.");
        }
      }
    }, 100);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      if (socket) {
        waitForSocketConnection(socket, () => {
          const messageData = JSON.stringify({ message: inputMessage });
          socket.send(messageData);
          setMessages([...messages, { text: inputMessage, sender: "workshop" }]);
          setInputMessage("");
        });
      } else {
        console.error("WebSocket instance not available.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Chat with User
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500">
            <IoClose size={24} />
          </button>
        </div>

        {/* Messages Section */}
        <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-3 rounded-xl ${
                message.sender === "workshop"
                  ? "bg-green-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-gray-800 self-start mr-auto"
              } max-w-[80%] shadow`}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="p-4 border-t flex items-center bg-white">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-full px-4 py-2 focus:outline-none shadow-sm"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-500 text-white px-4 py-2 rounded-r-full hover:bg-green-600 transition duration-300 flex items-center justify-center shadow-md"
          >
            <IoSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopChatModal;
