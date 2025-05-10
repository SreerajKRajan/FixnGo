  import React, { useState, useEffect, useRef } from "react";
  import { Send, X } from "lucide-react";
  import { formatDistanceToNow } from "date-fns";
  import axiosInstance from "../../utils/axiosInstance";
  import { useSelector } from "react-redux";

  const ChatWindow = ({chat, roomId, user, workshop, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const chatRef = useRef();

    const log_user = useSelector((state) => state.userAuth.user);

    const socketRef = useRef(null);

    useEffect(() => {
      if (!log_user.id) return;
      console.log('hii working')

      const socketUrl = `ws://127.0.0.1:8000/ws/chat/${log_user.id}/${6}/`;

      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data, 'data came through socket');
        const newMsg = {
          message_id: data.message_id || Date.now(),
          message: data.message,
          sender_type: data.sender_type,
          timestamp: data.timestamp || new Date().toISOString()
        };
        setMessages((prevMessages) => [...prevMessages, newMsg]);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket disconnected");
      };

      return () => {
        socketRef.current?.close();
      };
    }, []);

    const sendMessage = () => {
      if (message.trim()) {
        const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${log_user.id}/${6}/`);
        socket.onopen = () => {
          socket.send(
            JSON.stringify({
              message: message,
            })
          );
          setNewMessage("");
        };
      }
    };
    // Dummy user info
    const currentUser = { id: "current123", username: "CurrentUser" };
    const isWorkshop = false;

    // Determine which entity to show in the chat header
    const chatPartner = isWorkshop ? user : workshop;
    const chatPartnerName = isWorkshop ? user?.username : workshop?.name;
    const chatPartnerImage = isWorkshop
      ? user?.profile_image_url
      : workshop?.document;

      // Dummy messages data
    const dummyMessages = [
      {
        message_id: "msg1",
        message: "Hi there! I'm interested in your workshop",
        sender_type: "user",
        timestamp: "2025-03-17T14:23:00Z"
      },
      {
        message_id: "msg2",
        message: "Hello! Thanks for reaching out. What specific aspects are you curious about?",
        sender_type: "workshop",
        timestamp: "2025-03-17T14:25:00Z"
      },
      {
        message_id: "msg3",
        message: "I'd like to know more about the prerequisites and materials needed",
        sender_type: "user",
        timestamp: "2025-03-17T14:28:00Z"
      },
      {
        message_id: "msg4",
        message: "No special prerequisites needed! Just bring a notebook and your enthusiasm. We'll provide all other materials.",
        sender_type: "workshop",
        timestamp: "2025-03-17T14:30:00Z"
      }
    ];

    // Set dummy messages when component mounts
    useEffect(() => {
      setLoading(true);
      setTimeout(() => {
        setMessages(dummyMessages);
        setLoading(false);
      }, 500); // Simulate loading delay
    }, []);

    // Auto-scroll to the latest message
    useEffect(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, [messages]);

    // const sendMessage = (e) => {
    //   e.preventDefault();
      
    //   if (message.trim() !== "") {
    //     const newMessage = {
    //       message_id: `msg${Date.now()}`,
    //       message: message.trim(),
    //       sender_type: isWorkshop ? "workshop" : "user",
    //       timestamp: new Date().toISOString()
    //     };
        
    //     setMessages([...messages, newMessage]);
    //     setMessage("");
    //   }
    // };

    // Determine if a message is from the current user
    const isOwnMessage = (msg) => {
      if (isWorkshop) {
        return msg.sender_type === "workshop";
      } else {
        return msg.sender_type === "user";
      }
    };

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
                e.target.src = "";
              }}
            />
            <span className="font-semibold truncate">{chatPartnerName || "Chat"}</span>
          </div>
          <div className="flex items-center space-x-2">
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
                  isOwnMessage(msg)
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

        <div
          className="flex items-center p-3 border-t border-gray-300"
        >
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
          onClick={sendMessage}
            type="button"
            className={`ml-2 ${
              message.trim() ? "text-blue-500" : "text-gray-400"
            }`}
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  };

  export default ChatWindow;