import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";

import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ChatContext } from "../../context/ChatContext";

function ChatContainer() {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext); // fixed here
  const scrollEndRef = useRef();
  const [input, setInput] = useState("");

  const getInitials = (fullName) =>
    (fullName || "User")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Send image message
  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an Image File");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = ""; // reset input
    };
    reader.readAsDataURL(file);
  };

  // Auto scroll to bottom on messages change
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load conversation when a user is selected
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?._id]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-blue-300 bg-linear-to-br from-black/80 to-blue-900/20 backdrop-blur-xl border border-white/10 rounded-xl max-md:hidden h-full">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-600/70 to-cyan-400/50 flex items-center justify-center text-lg font-semibold text-white shadow-lg shadow-blue-900/30">
          {getInitials(authUser?.fullName)}
        </div>
        <p className="text-lg font-semibold tracking-wide">Chat Anytime, Anywhere</p>
      </div>
    );
  }

  const currentUserId = authUser?._id;

  return (
    <div className="h-full overflow-hidden relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl shadow-lg shadow-blue-900/20">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-white/10 bg-linear-to-r from-blue-900/40 to-black/40 backdrop-blur-lg">
        {selectedUser?.profilePic ? (
          <img
            src={selectedUser.profilePic}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400/40"
          />
        ) : (
          <div className="w-8 h-8 rounded-full ring-2 ring-blue-400/40 bg-linear-to-br from-blue-600/70 to-cyan-400/50 flex items-center justify-center text-[10px] font-semibold text-white">
            {getInitials(selectedUser.fullName)}
          </div>
        )}
        <p className="flex-1 text-blue-200 flex items-center gap-2 font-medium">
          {selectedUser.fullName}
          {onlineUser?.some((id) => id.toString() === selectedUser._id.toString()) && (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-5 cursor-pointer hover:scale-110 transition-transform"
        />
        <img
          src={assets.help_icon}
          alt="Help"
          className="hidden md:block w-5 cursor-pointer hover:scale-110 transition-transform"
        />
      </div>

      {/* Chat Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === currentUserId;

          return (
            <div
              key={msg._id || index}
              className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              {!isCurrentUser && (
                selectedUser?.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-400/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full ring-1 ring-blue-400/30 bg-linear-to-br from-blue-600/70 to-cyan-400/50 flex items-center justify-center text-[10px] font-semibold text-white">
                    {getInitials(selectedUser.fullName)}
                  </div>
                )
              )}

              <div className="max-w-[65%]">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt=""
                    className="rounded-lg border border-white/10 shadow-md shadow-blue-900/30"
                  />
                ) : (
                  <p
                    className={`p-3 text-sm text-blue-100 wrap-break-word rounded-lg shadow-lg backdrop-blur-md ${
                      isCurrentUser
                        ? "bg-linear-to-br from-blue-600/50 to-blue-400/40 border border-blue-300/30 rounded-br-none"
                        : "bg-linear-to-br from-black/40 to-blue-900/30 border border-white/10 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <p className="text-[10px] text-blue-300/70 mt-1 text-right">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>

              {isCurrentUser && (
                authUser?.profilePic ? (
                  <img
                    src={authUser.profilePic}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-400/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full ring-1 ring-blue-400/30 bg-linear-to-br from-blue-600/70 to-cyan-400/50 flex items-center justify-center text-[10px] font-semibold text-white">
                    {getInitials(authUser?.fullName)}
                  </div>
                )
              )}
            </div>
          );
        })}
        <div ref={scrollEndRef}></div>
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-linear-to-r from-black/40 to-blue-900/30 backdrop-blur-xl border-t border-white/10"
      >
        <div className="flex-1 flex items-center bg-blue-900/20 border border-blue-400/30 px-3 rounded-full backdrop-blur-lg">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Send a message..."
            aria-label="Type your message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-blue-100 placeholder-blue-300/60 bg-transparent"
          />
          <input
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
            onChange={handleSendImage}
            aria-label="Upload image"
          />
          <label htmlFor="image" className="cursor-pointer">
            <img
              src={assets.gallery_icon}
              alt="Upload"
              className="w-5 mr-2 hover:opacity-80 hover:scale-110 transition-transform"
            />
          </label>
        </div>
        <button
          type="submit"
          aria-label="Send message"
          className="w-7 cursor-pointer hover:opacity-80 hover:scale-110 transition-transform"
        >
          <img src={assets.send_button} alt="Send" />
        </button>
      </form>
    </div>
  );
}

export default ChatContainer;
