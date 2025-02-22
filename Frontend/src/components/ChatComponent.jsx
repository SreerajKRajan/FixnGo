"use client"

import React, { useState } from "react"
import { Search, MessageSquare, ChevronUp, ChevronDown, X, Minimize2, Maximize2, Send } from "lucide-react"

const ChatComponent = () => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeChatId, setActiveChatId] = useState(null) // Track the currently active chat
  const [searchQuery, setSearchQuery] = useState("")

  // Sample messages data
  const messages = [
    {
      id: "1",
      userId: "user1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Hey, how are you?",
      timestamp: "2h ago",
      isOnline: true,
    },
    {
      id: "2",
      userId: "user2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can we schedule a meeting?",
      timestamp: "1d ago",
      isOnline: false,
    },
    // Add more messages as needed
  ]

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const openChat = (userId) => {
    setActiveChatId(userId) // Set the active chat ID
  }

  const closeChat = () => {
    setActiveChatId(null) // Close the chat box
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-row-reverse items-end">
      {/* Chat List Panel */}
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
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition duration-200"
                  onClick={() => openChat(message.userId)}
                >
                  <div className="relative">
                    <img
                      src={message.avatar || "/placeholder.svg"}
                      alt={message.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {message.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{message.name}</p>
                    <p className="text-sm text-gray-500 truncate">{message.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Single Chat Box */}
      {activeChatId && (
        <div className="mr-2">
          <ChatWindow
            userId={activeChatId}
            onClose={closeChat}
            user={messages.find((message) => message.userId === activeChatId)}
          />
        </div>
      )}
    </div>
  )
}

const ChatWindow = ({ userId, onClose, user }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")

  const toggleMinimize = () => setIsMinimized(!isMinimized)

  const sendMessage = (e) => {
    e.preventDefault()
    // Here you would typically send the message to your backend
    console.log("Sending message:", message)
    setMessage("")
  }

  return (
    <div className="w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg mb-1">
      <div className="flex items-center justify-between p-3 bg-black text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
          <span className="font-semibold">{user.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleMinimize} className="hover:bg-gray-700 p-1 rounded">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X size={18} />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="h-64 p-3 overflow-y-auto bg-gray-50">
            {/* Chat messages would go here */}
            <p className="text-gray-500 text-center">No messages yet</p>
          </div>
          <form onSubmit={sendMessage} className="flex items-center p-3 border-t border-gray-300">
            <input
              type="text"
              placeholder="Write a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="ml-2 text-black hover:text-gray-700 transition duration-200">
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default ChatComponent