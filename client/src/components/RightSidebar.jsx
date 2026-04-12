import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

function RightSidebar({ selectedUser, onLogout }) {
  const { messages } = useContext(ChatContext);

  const getInitials = (fullName) =>
    (fullName || "User")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  if (!selectedUser) return null;

  const imageMessages = messages
    .filter((message) => message.image)
    .slice(-6)
    .reverse();

  return (
    <div
      className="bg-black/40 backdrop-blur-2xl border-l border-blue-400/20 text-blue-100 w-full relative overflow-y-auto h-full pb-24 shadow-lg shadow-blue-900/20 max-md:hidden"
    >
      {/* Profile Section */}
      <div className="pt-16 flex flex-col items-center gap-3 text-sm font-light mx-auto">
        {selectedUser.profilePic ? (
          <img
            src={selectedUser.profilePic}
            alt={`${selectedUser.fullName} Profile`}
            className="w-20 h-20 rounded-full object-cover border border-blue-400/30 shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/40"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border border-blue-400/30 shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/40 bg-linear-to-br from-blue-600/70 to-cyan-400/50 flex items-center justify-center text-xl font-semibold text-white">
            {getInitials(selectedUser.fullName)}
          </div>
        )}

        {/* Full Name & Status */}
        <div className="flex items-center gap-2">
          {/* Example: You can toggle online status later */}
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <h1 className="text-lg font-semibold text-blue-200">
            {selectedUser.fullName}
          </h1>
        </div>

        {/* Bio */}
        {selectedUser.bio && (
          <p className="px-4 text-center text-blue-300/80 text-xs">
            {selectedUser.bio}
          </p>
        )}
      </div>

      {/* Divider */}
      <hr className="mt-5 mx-6 border-blue-400/20" />

      {/* Media Section */}
      {imageMessages.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-4">
          {imageMessages.map((message, index) => (
            <div
              key={message._id || index}
              onClick={() => window.open(message.image, "_blank")}
              className="cursor-pointer group"
            >
              <img
                src={message.image}
                alt={`media-${index}`}
                className="w-full rounded-md object-cover aspect-square transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-900/40"
              />
            </div>
          ))}
        </div>
      )}

      {imageMessages.length === 0 && (
        <p className="px-4 py-6 text-center text-xs text-blue-300/70">
          No image messages yet.
        </p>
      )}

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-700/70 to-blue-500/60 backdrop-blur-lg border border-blue-300/20 text-blue-100 text-sm font-medium py-2 px-8 rounded-full cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-blue-900/30 transition-all"
      >
        Logout
      </button>
    </div>
  );
}

export default RightSidebar;
