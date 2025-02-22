import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const MessageList = ({ searchQuery, onChatOpen }) => {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const user = useSelector((state) => state.userAuth.user);
  const workshop = useSelector((state) => state.workshopAuth.workshop);
  console.log("User: ", user)
  console.log("workshop: ", workshop)

  // Determine the current user type
  const currentUser = user || workshop;
  const currentUserId = currentUser?.id;
  const isUser = !!user; // True if it's a user, false if it's a workshop
  const token = isUser
    ? localStorage.getItem("token")
    : localStorage.getItem("workshopToken");
  console.log("currentUserId", currentUserId)
  console.log("token", token)
  useEffect(() => {
    if (!currentUser) {
      console.error("No user or workshop found");
      return;
    }

    // Establish WebSocket connection with appropriate user ID
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/list/${currentUserId}/?token=${token}`
    );

    ws.onopen = () => {
      console.log(
        `WebSocket connection established for chat list (${isUser ? "User" : "Workshop"})`
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received chat rooms:", data);

        if (data.type === "chat_rooms") {
          setUsers(data.chat_rooms || []);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (currentUser) {
          console.log("Attempting to reconnect...");
          // The component will re-render and try to establish a new connection
        }
      }, 3000);
    };

    setSocket(ws);

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentUser]);

  const filteredMessages = users.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.last_message &&
        chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {filteredMessages.map((chat) => (
        <div
          key={chat.id}
          className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition duration-200"
          onClick={() => onChatOpen(chat)}
        >
          <div className="relative">
            <img
              src={chat.document || "/default-avatar.png"}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{chat.name}</p>
            <p className="text-sm text-gray-500 truncate">
              {chat.last_message || "No messages yet"}
            </p>
          </div>
          {chat.timestamp && (
            <div className="text-xs text-gray-400">
              {new Date(chat.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
