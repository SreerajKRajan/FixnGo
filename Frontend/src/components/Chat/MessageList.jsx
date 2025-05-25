import React from "react";
import { formatDistanceToNow } from "date-fns";

const MessageList = ({ role, searchQuery, onChatOpen, chatThreads, loading, error, onRefresh }) => {
  // Show a loader if chat threads are being fetched
  if (loading) return <div className="p-4 text-center">Loading chats...</div>;

  // Show an error if one occurred during fetching
  if (error) return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-2">Error: {error}</p>
      <button 
        onClick={onRefresh}
        className="text-blue-500 underline"
      >
        Try again
      </button>
    </div>
  );

  // Show a message if there are no chat threads available
  if (!chatThreads || chatThreads.length === 0) {
    return <div className="p-4 text-center text-gray-500">No chats available.</div>;
  }

  // Filter chat threads based on the search query
  const filteredThreads = chatThreads.filter((chat) => {
    // Get the name of the other party - could be user or workshop
    let name = "Unknown";
    let lastMessage = chat.last_message || "";
    
    // If current user is workshop, look for user_details
    if (role === 'workshop' && chat.user_details) {
      // Fix: Prioritize name over username and email
      name = chat.user_details.name || chat.user_details.username || "Unknown User";
    } 
    // If current user is regular user, look for workshop_details
    else if (role === 'user' && chat.workshop_details) {
      name = chat.workshop_details.name || "Unknown Workshop";
    }
    
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="divide-y divide-gray-200">
      {filteredThreads.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No matching chats found.</div>
      ) : (
        filteredThreads.map((chat, index) => {
          // Determine which details to display based on user role
          let name, image;
          
          if (role === 'workshop' && chat.user_details) {
            // Fix: Prioritize name over email for workshop view
            name = chat.user_details.name || chat.user_details.username || "User";
            image = chat.user_details.profile_image_url;
          } else if (role === 'user' && chat.workshop_details) {
            // Regular users see workshop details
            name = chat.workshop_details.name || "Workshop";
            // Fix: Consider both document and profile_image_url paths
            image = chat.workshop_details.document || chat.workshop_details.profile_image_url;
          }
            
          const lastMessage = chat.last_message || "No messages yet";
          const timestamp = chat.last_message_timestamp || chat.created_at;
          const unread = chat.unread_count || 0;

          // Create a unique key using both the chat ID and the index
          const uniqueKey = `${chat.id}_${index}`;

          return (
            <div 
              key={uniqueKey} 
              className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
              onClick={() => onChatOpen(chat)}  
            >
              <div className="flex items-center relative">
                <img 
                  src={image} 
                  alt={name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    // e.target.src = "/default-avatar.png";
                  }}
                />
                {unread > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {unread}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{name}</p>
                <p className="text-gray-500 truncate text-sm">{lastMessage}</p>
              </div>

              {timestamp && (
                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;