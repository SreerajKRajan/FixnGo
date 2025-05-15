import React, { useState, useEffect } from "react";
import { Search, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import MessageList from "./MessageList";
import ChatWindow from "./ChatWindow";
import axiosInstance from "../../utils/axiosInstance";

const ChatComponent = ({ role, newChat, onChatClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch chat threads when component mounts
  useEffect(() => {
    fetchChatThreads();
  }, []);

  // Fetch chat threads from the API
  const fetchChatThreads = async () => {
    try {
      setLoading(true);
      console.log("Fetching chat threads...");
      const response = await axiosInstance.get('/chat/threads/');
      console.log("Chat threads response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setThreads(response.data);
      } else {
        // If response is not an array, use empty array
        console.warn("Chat threads response is not an array:", response.data);
        setThreads([]);
      }
    } catch (error) {
      console.error("Failed to fetch chat threads:", error);
      setError("Failed to load chats. Please try again.");
      
      // Fall back to empty array for threads
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle the chat panel
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Open a chat window
  const openChat = (chat) => {
    setActiveChat(chat);
  };

  // Close a chat window
  const closeChat = () => {
    setActiveChat(null);
    // Call the onChatClose prop if it exists
    if (onChatClose) onChatClose();
  };

  // Handle new chat prop changes
  useEffect(() => {
    if (newChat && (!activeChat || newChat.id !== activeChat.id)) {
      setActiveChat(newChat);
    }
  }, [newChat, activeChat]);

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-row-reverse items-end">
      <div className="w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg">
        <div
          className="flex items-center justify-between p-3 cursor-pointer bg-black text-white rounded-t-lg"
          onClick={toggleExpand}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <span className="font-semibold">Messaging</span>
          </div>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
        {isExpanded && (
          <div className="p-3">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search messages"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <MessageList
              role={role}
              searchQuery={searchQuery}
              onChatOpen={openChat}
              chatThreads={threads}
              loading={loading}
              error={error}
              onRefresh={fetchChatThreads}
            />
          </div>
        )}
      </div>
      {activeChat && (
        <ChatWindow
          chat={activeChat}
          roomId={activeChat.id} 
          user={activeChat.user_details} 
          workshop={activeChat.workshop_details}
          onClose={closeChat}
          onMessageSent={fetchChatThreads} // Refresh threads when message sent
        />
      )}
    </div>
  );
};

export default ChatComponent;