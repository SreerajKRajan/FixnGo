import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

const ChatWindow = ({ chat, roomId, role, chatPartner, onClose, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [optimisticMessageId, setOptimisticMessageId] = useState(null);
  const chatRef = useRef();
  const socketRef = useRef(null);

  const loggedInUser = useSelector((state) => 
    role === 'workshop' 
      ? state.workshopAuth.workshop 
      : state.userAuth.user
  );
  
  // Determine if the user is chatting with a workshop or another user
  const isWorkshop = role === 'user';
  
  // Fix: Use proper property names for chat partner details
  const chatPartnerName = isWorkshop 
    ? (chatPartner?.name || "Workshop") 
    : (chatPartner?.name || chatPartner?.username || "User");
    
  // Fix: Use correct image property paths
  const chatPartnerImage = isWorkshop 
    ? (chatPartner?.document || chatPartner?.profile_image_url)
    : (chatPartner?.profile_image_url);
    
  const chatPartnerId = chatPartner?.id;

  // Mark messages as read when chat window opens
  useEffect(() => {
    if (roomId) {
      markMessagesAsRead();
    }
  }, [roomId]);

  const markMessagesAsRead = async () => {
    try {
      // Determine the appropriate endpoint based on role
      const endpoint = role === 'workshop' 
        ? `/workshop/chat/mark-read/${roomId}/`
        : `/users/chat/mark-read/${roomId}/`;
      
      await axiosInstance.post(endpoint);
      // Refresh threads to update unread counts
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  // Extract IDs from roomId or create the proper format
  useEffect(() => {
    if (!loggedInUser?.id || !chatPartnerId) {
      console.warn("No logged in user or chat partner found");
      return;
    }

    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    let userId, workshopId;
    
    if (role === 'user') {
      // Current user is a regular user, chatting with a workshop
      userId = loggedInUser.id;
      workshopId = chatPartnerId;
    } else {
      // Current user is a workshop, chatting with a regular user
      userId = chatPartnerId;
      workshopId = loggedInUser.id;
    }

    // Get the appropriate token
    const token = localStorage.getItem(role === 'workshop' ? "workshopToken" : "token") || localStorage.getItem("token");
    
    // Setup the WebSocket connection with the correct parameters
    const socketUrl = `ws://${window.location.hostname}:8000/ws/chat/${userId}/${workshopId}/?token=${token}`;
    
    try {
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        setSocketStatus("connected");
        // Load message history when connection opens
        fetchChatHistory(userId, workshopId);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle chat_message type
          if (data.type === "chat_message") {
            setMessages((prevMessages) => {
              // If this is our optimistic message being confirmed, replace it
              if (optimisticMessageId && data.sender_id === loggedInUser.id && 
                  prevMessages.some(m => m.message_id === optimisticMessageId && m.message === data.message)) {
                // Remove optimistic message ID to prevent duplicates
                setOptimisticMessageId(null);
                // Replace temporary message with confirmed message
                return prevMessages.map(msg => 
                  msg.message_id === optimisticMessageId 
                    ? { ...msg, message_id: data.message_id, timestamp: data.timestamp }
                    : msg
                );
              }
              
              // Check if message already exists in our list
              const messageExists = prevMessages.some(msg => 
                msg.message_id === data.message_id || 
                (data.temporary_id && msg.message_id === data.temporary_id)
              );

              if (!messageExists) {
                const newMsg = {
                  message_id: data.message_id,
                  message: data.message,
                  sender_type: data.sender_id === loggedInUser.id ? "user" : "other",
                  timestamp: data.timestamp || new Date().toISOString(),
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

      socketRef.current.onclose = () => {
        setSocketStatus("disconnected");
      };

      socketRef.current.onerror = () => {
        setSocketStatus("error");
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setSocketStatus("error");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [loggedInUser?.id, chatPartnerId, role, onMessageSent]);

  // Fetch chat history from backend
  const fetchChatHistory = async (userId, targetId) => {
    try {
      setLoading(true);
      
      if (!userId || !targetId) {
        console.warn("Missing user ID or target ID for chat history");
        setLoading(false);
        return;
      }

      // Call the appropriate API endpoint based on role
      const endpoint = role === 'workshop' 
        ? `/workshop/chat/history/${userId}/` // Workshop viewing history with a user
        : `/users/chat/history/${targetId}/`; // User viewing history with a workshop
        
      const response = await axiosInstance.get(endpoint);

      if (response.data && Array.isArray(response.data)) {
        const formattedMessages = response.data.map((msg) => ({
          message_id: msg.id,
          message: msg.message,
          sender_type: msg.sender === loggedInUser.email ? "user" : "other",
          timestamp: msg.timestamp,
        }));
        setMessages(formattedMessages);
      } else {
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
      return;
    }

    // Ensure socket is open before sending
    if (socketRef.current.readyState === WebSocket.OPEN) {
      // Create a temporary ID for optimistic UI updates
      const tempId = `temp-${Date.now()}`;
      setOptimisticMessageId(tempId);
      
      const messageData = {
        message: message.trim(),
        temporary_id: tempId,
        sender_id: loggedInUser.id
      };

      socketRef.current.send(JSON.stringify(messageData));

      // Add message optimistically to UI
      const tempMsg = {
        message_id: tempId,
        message: message.trim(),
        sender_type: "user",
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, tempMsg]);
      setMessage("");
    } else {
      alert("Connection lost. Please refresh the page.");
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
            src={chatPartnerImage}
            alt={chatPartnerName}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.target.onError = null;
              // e.target.src = "/default-avatar.png";
            }}
          />
          <span className="font-semibold truncate">
            {chatPartnerName}
          </span>
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
            message.trim() && socketStatus === "connected"
              ? "text-blue-500"
              : "text-gray-400"
          }`}
          disabled={!message.trim() || socketStatus !== "connected"}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;