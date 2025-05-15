import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

const ChatWindow = ({ chat, roomId, user, workshop, onClose, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const chatRef = useRef();
  const socketRef = useRef(null);

  const loggedInUser = useSelector((state) => state.userAuth.user);

  // Determine if the user is chatting with a workshop or another user
  const isWorkshop = !!workshop;
  const chatPartnerName = isWorkshop ? workshop?.name : user?.username;
  const chatPartnerImage = isWorkshop ? workshop?.document : user?.profile_image_url;

  // WebSocket connection setup
  useEffect(() => {
    if (!loggedInUser?.id) {
      console.warn("No logged in user found");
      return;
    }
    
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Use the correct workshop_id or user_id for the chat room
    const targetId = isWorkshop ? workshop?.id : user?.id;
    if (!targetId) {
      console.warn("No target ID found");
      return;
    }

    // Setup the WebSocket connection
    const socketUrl = `ws://${window.location.hostname}:8000/ws/chat/${loggedInUser.id}/${targetId}/`;
    console.log("Connecting to WebSocket at:", socketUrl);
    
    try {
      socketRef.current = new WebSocket(socketUrl);
      
      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        setSocketStatus("connected");
        // Load message history when connection opens
        fetchChatHistory();
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message received:", data);
          
          // Handle chat_message type
          if (data.type === "chat_message") {
            setMessages(prevMessages => {
              // Check if this message already exists in our list
              const messageExists = prevMessages.some(msg => 
                (data.message_id && msg.message_id === data.message_id) || 
                (data.timestamp && msg.timestamp === data.timestamp && msg.message === data.message)
              );
              
              if (!messageExists) {
                const newMsg = {
                  message_id: data.message_id || Date.now().toString(),
                  message: data.message,
                  sender_type: data.username === loggedInUser.email ? "user" : "other",
                  timestamp: data.timestamp || new Date().toISOString()
                };
                
                return [...prevMessages, newMsg];
              }
              
              return prevMessages;
            });
            
            // Refresh chat threads when a new message is received
            if (onMessageSent) {
              onMessageSent();
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event);
        setSocketStatus("disconnected");
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setSocketStatus("error");
      };

    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setSocketStatus("error");
    }

    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection");
        socketRef.current.close();
      }
    };
  }, [loggedInUser?.id, isWorkshop, workshop?.id, user?.id, onMessageSent]);

  // Fetch chat history from backend
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const targetId = isWorkshop ? workshop?.id : user?.id;
      
      if (!loggedInUser?.id || !targetId) {
        console.warn("Missing user ID or target ID for chat history");
        setLoading(false);
        return;
      }
      
      console.log(`Fetching chat history for user ${loggedInUser.id} and target ${targetId}`);
      
      // Call the API endpoint to get chat history
      const response = await axiosInstance.get(`/chat/history/${loggedInUser.id}/${targetId}/`);
      console.log("Chat history response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const formattedMessages = response.data.map(msg => ({
          message_id: msg.id,
          message: msg.message,
          sender_type: msg.sender === loggedInUser.email ? "user" : "other",
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      } else {
        console.warn("Invalid chat history response:", response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) {
      console.warn("Can't send message: message empty or no socket connection");
      return;
    }

    console.log(socketRef.current.readyState, 'current state')

    // Ensure socket is open before sending
    if (socketRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        message: message.trim()
      };
      
      console.log("Sending message:", messageData);
      socketRef.current.send(JSON.stringify(messageData));
      
      // Add message optimistically to UI
      const tempMsg = {
        message_id: `temp-${Date.now()}`,
        message: message.trim(),
        sender_type: "user",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, tempMsg]);
      setMessage("");
    } else {
      console.error("WebSocket is not connected. Current state:", socketRef.current.readyState);
      alert("Connection lost. Please refresh the page.");
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg mr-2">
      <div className="flex items-center justify-between p-3 bg-black text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <img
            src={chatPartnerImage || "/default-avatar.png"}
            alt={chatPartnerName}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.target.onError = null;
              e.target.src = "/default-avatar.png";
            }}
          />
          <span className="font-semibold truncate">{chatPartnerName || "Chat"}</span>
        </div>
        <div className="flex items-center space-x-2">
          {socketStatus !== "connected" && (
            <span className="text-xs text-red-300">
              {socketStatus === "connecting" ? "Connecting..." : "Disconnected"}
            </span>
          )}
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="h-64 p-3 overflow-y-auto bg-gray-50" ref={chatRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <span>No messages yet. Start the conversation!</span>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.message_id || index}
              className={`p-2 mb-2 max-w-[80%] rounded-lg ${
                msg.sender_type === "user"
                  ? "ml-auto bg-blue-500 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg"
                  : "mr-auto bg-gray-200 text-gray-800 rounded-br-lg rounded-tr-lg rounded-tl-lg"
              }`}
            >
              <div className="break-words">{msg.message}</div>
              <div className="text-xs opacity-75 mt-1">
                {msg.timestamp
                  ? formatDistanceToNow(new Date(msg.timestamp), {
                      addSuffix: true,
                    })
                  : "Just now"}
              </div>
            </div>
          ))
        )}
      </div>

      <form 
        className="flex items-center p-3 border-t border-gray-300"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={socketStatus !== "connected"}
        />
        <button
          type="submit"
          className={`ml-2 ${
            message.trim() && socketStatus === "connected" ? "text-blue-500" : "text-gray-400"
          }`}
          disabled={!message.trim() || socketStatus !== "connected"}
        >
          <Send size={20}/>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;