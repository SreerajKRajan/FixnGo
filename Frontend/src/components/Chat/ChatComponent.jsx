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

  // Fetch chat threads when component mounts or role changes
  useEffect(() => {
    fetchChatThreads();
  }, [role]);

  // Fetch chat threads from the API based on role
  const fetchChatThreads = async () => {
    try {
      setLoading(true);
      const endpoint = role === 'workshop' ? '/workshop/chat/threads/' : '/users/chat/threads/';
      const response = await axiosInstance.get(endpoint);
      
      if (response.data && Array.isArray(response.data)) {
        // Sort threads by last message timestamp (newest first)
        const sortedThreads = response.data.sort((a, b) => 
          new Date(b.last_message_timestamp) - new Date(a.last_message_timestamp)
        );
        
        // Fix: Deduplicate threads based on unique user IDs for workshop side
        if (role === 'workshop') {
          const uniqueThreads = [];
          const seenUserIds = new Set();
          
          for (const thread of sortedThreads) {
            const userId = thread.user_details?.id;
            if (userId && !seenUserIds.has(userId)) {
              seenUserIds.add(userId);
              uniqueThreads.push(thread);
            }
          }
          setThreads(uniqueThreads);
        } else {
          setThreads(sortedThreads);
        }
      } else {
        setThreads([]);
      }
    } catch (error) {
      console.error("Failed to fetch chat threads:", error);
      setError("Failed to load chats. Please try again.");
      setThreads([]);
    } finally {
      setLoading(false);
    }
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
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <span className="font-semibold">
              {role === 'workshop' ? 'Customer Messages' : 'Workshop Messages'}
            </span>
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
              onChatOpen={setActiveChat}
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
          role={role}
          chatPartner={
            role === 'workshop' 
              ? activeChat.user_details 
              : activeChat.workshop_details
          }
          onClose={() => {
            setActiveChat(null);
            if (onChatClose) onChatClose();
          }}
          onMessageSent={fetchChatThreads}
        />
      )}
    </div>
  );
};

export default ChatComponent;