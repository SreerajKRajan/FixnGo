import React, { useState, useEffect } from "react";
import { Search, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import MessageList from "./MessageList";
import ChatWindow from "./ChatWindow";

const ChatComponent = ({ newChat, onChatClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const chats = []
  
  // Dummy chat threads data
  const dummyThreads = [
    {
      id: "chat1",
      user_details: { username: "JohnDoe", profile_image_url: "/default-avatar.png" },
      workshop_details: null,
      last_message: "Hey, when is the next workshop?",
      last_message_timestamp: "2025-03-17T14:23:00Z",
      unread_count: 2,
      created_at: "2025-03-15T10:00:00Z"
    },
    {
      id: "chat2",
      user_details: null,
      workshop_details: { name: "Photography Basics", document: "/default-avatar.png" },
      last_message: "We'll cover lighting techniques tomorrow",
      last_message_timestamp: "2025-03-18T09:12:00Z",
      unread_count: 0,
      created_at: "2025-03-10T16:30:00Z"
    },
    {
      id: "chat3",
      user_details: { username: "SarahSmith", profile_image_url: "/default-avatar.png" },
      workshop_details: null,
      last_message: "Thanks for the feedback!",
      last_message_timestamp: "2025-03-16T18:45:00Z",
      unread_count: 1,
      created_at: "2025-03-08T11:20:00Z"
    }
  ];
  
  const [threads, setThreads] = useState(dummyThreads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      // Don't auto-expand the message list when a new chat is initialized from outside
      // setIsExpanded(true); - removing this line
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
              searchQuery={searchQuery}
              onChatOpen={openChat}
              chatThreads={threads}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </div>
      {activeChat && (
        <ChatWindow
          chat = {activeChat}
          roomId={activeChat.id} 
          user={activeChat.user_details || activeChat.user} 
          workshop={activeChat.workshop_details || activeChat.workshop}
          onClose={closeChat} 
        />
      )}
    </div>
  );
};

export default ChatComponent; 