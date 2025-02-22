"use client"

import { useEffect, useState } from "react"
import { Search, MessageSquare, ChevronUp, ChevronDown } from "lucide-react"
import MessageList from "./MessageList"
import ChatWindow from "./ChatWindow"

const LinkedInMessages = ({ newChat }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeChat, setActiveChat] = useState(null) // Store full user object
  const [searchQuery, setSearchQuery] = useState("")

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const openChat = (user) => {
    setActiveChat(user) // Set full user object
  }

  const closeChat = () => {
    setActiveChat(null) // Hide the chatbox when closing
  }

    // Open chat when a new chat request comes from the workshop details page
    useEffect(() => {
      if (newChat) {
        setActiveChat(newChat);
      }
    }, [newChat]);

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
            <MessageList searchQuery={searchQuery} onChatOpen={openChat} />
          </div>
        )}
      </div>
      {activeChat && (
        <div className="flex mr-2">
          <ChatWindow key={activeChat.userId} user={activeChat} onClose={closeChat} />
        </div>
      )}
    </div>
  )
}

export default LinkedInMessages
