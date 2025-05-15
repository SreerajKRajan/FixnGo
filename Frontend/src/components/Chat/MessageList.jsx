import React from "react";
import { formatDistanceToNow } from "date-fns";

const MessageList = ({ role, searchQuery, onChatOpen, chatThreads, loading, error }) => {
  // Show a loader if chat threads are being fetched
  if (loading) return <div className="p-4 text-center">Loading chats...</div>;

  // Show an error if one occurred during fetching
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  // Show a message if there are no chat threads available
  if (!chatThreads || chatThreads.length === 0) {
    return <div className="p-4 text-center text-gray-500">No chats available.</div>;
  }

  // Filter chat threads based on the search query
  const filteredThreads = chatThreads.filter((chat) => {
    // Determine if it's a user or workshop profile we need to display
    const isCurrentUserWorkshop = chat.user_details && !chat.workshop_details;
    
    // Get the name of the other party
    const name = isCurrentUserWorkshop 
      ? (chat.workshop_details?.name || "Unknown Workshop") 
      : (chat.user_details?.username || "Unknown User");
      
    const lastMessage = chat.last_message || "";
    
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="divide-y divide-gray-200">
      {filteredThreads.map((chat) => {
        // Determine if the current user is a workshop or regular user
        const isCurrentUserWorkshop = chat.user_details && !chat.workshop_details;
        
        // Display the other party's info
        // const name = isCurrentUserWorkshop 
        //   ? (chat.workshop_details?.name || "Unknown Workshop") 
        //   : (chat.user_details?.username || "Unknown User");
          
        const image = isCurrentUserWorkshop 
          ? (chat.workshop_details?.document) 
          : (chat.user_details?.profile_image_url);
          
        const lastMessage = chat.last_message || "No messages yet";
        const timestamp = chat.last_message_timestamp || chat.created_at;
        const unread = chat.unread_count || 0;

        return (
          <div 
            key={chat.id} 
            className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
            onClick={() => onChatOpen(chat)}  
          >
            <div className="flex items-center relative">
              <img 
                src={image} 
                alt=''
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
              {unread > 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {unread}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{chat?.user_details?.name}</p>
              <p className="text-gray-500 truncate text-sm">{lastMessage}</p>
            </div>

            {timestamp && (
              <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;