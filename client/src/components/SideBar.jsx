/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext, useRef } from "react";
import assets from "./../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

function SideBar() {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUser = [] } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimerRef = useRef(null);
  const navigate = useNavigate();

  const getInitials = (fullName) =>
    (fullName || "User")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // Fetch users initially and whenever online users change
  useEffect(() => {
    if (onlineUser && onlineUser.length >= 0) {
      getUsers();
    }
  }, [onlineUser]);

  // Filter users by search input (case-insensitive)
  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  // Check if a user is online, normalize IDs to string for safe comparison
  const isUserOnline = (userId) =>
    userId &&
    Array.isArray(onlineUser) &&
    onlineUser.some((id) => id?.toString() === userId?.toString());

  // Handle selecting a user:
  // Set selected user and clear unseen messages count locally for that user
  const handleSelectUser = (user) => {
    setSelectedUser(user);

    if (unseenMessages[user._id]) {
      setUnseenMessages((prev) => {
        const copy = { ...prev };
        delete copy[user._id];
        return copy;
      });
    }
  };

  // Optional: Confirm before logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMenuOpen(true);
  };

  const scheduleCloseMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), 200);
  };

  return (
    <div
      className={`bg-black/40 backdrop-blur-2xl border-r border-blue-400/20 shadow-lg shadow-blue-900/20 h-full p-5 rounded-r-xl overflow-y-auto text-blue-100 ${
        selectedUser ? "max-md:hidden" : ""
      }`}
      role="navigation"
      aria-label="User sidebar"
    >
      {/* Logo & Menu */}
      <div className="flex justify-between items-center pb-5">
        <img
          src={assets.logo}
          alt="logo"
          className="max-w-40 drop-shadow-lg"
        />
        <div
          className="relative inline-block"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleCloseMenu}
        >
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="max-h-5 cursor-pointer hover:opacity-80 hover:scale-105 transition-transform"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          />
          {menuOpen && (
            <div
              className="
                z-40 absolute top-full right-0 mt-2 w-40 rounded-md
                bg-blue-900/30 backdrop-blur-lg border border-blue-400/20
                shadow-lg shadow-blue-900/30
              "
              onMouseEnter={openMenu}
              onMouseLeave={scheduleCloseMenu}
            >
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full text-left cursor-pointer px-4 py-2 hover:bg-blue-800/40 text-sm text-blue-200"
                role="menuitem"
              >
                Edit Profile
              </button>
              <hr className="border-blue-400/20" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left cursor-pointer px-4 py-2 hover:bg-blue-800/40 text-sm text-blue-200"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-blue-900/20 border border-blue-400/30 rounded-full flex items-center gap-2 py-2 px-4 mb-5 backdrop-blur-lg">
        <img src={assets.search_icon} alt="search" className="w-4 opacity-80" />
        <input
          type="text"
          placeholder="Search user..."
          className="bg-transparent border-none outline-none text-sm text-blue-100 placeholder-blue-300/70 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Search user"
          spellCheck={false}
        />
      </div>

      {/* User List */}
      <div className="flex flex-col gap-1" role="list">
        {filteredUsers.map((user, index) => (
          <div
            key={user._id || index}
            onClick={() => handleSelectUser(user)}
            className={`relative flex items-center gap-3 p-2 pl-4 rounded-md cursor-pointer transition-all ${
              selectedUser?._id === user._id
                ? "bg-blue-700/40 border border-blue-400/20"
                : "hover:bg-blue-900/30 border border-transparent"
            }`}
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelectUser(user);
            }}
          >
            <img
              src={user?.profilePic || ""}
              alt={`${user.fullName} profile`}
              className={`w-10 h-10 rounded-full object-cover ring-1 ring-blue-400/30 ${
                user?.profilePic ? "" : "hidden"
              }`}
            />
            {!user?.profilePic && (
              <div className="w-10 h-10 rounded-full ring-1 ring-blue-400/30 bg-linear-to-br from-blue-600/70 to-cyan-400/50 flex items-center justify-center text-xs font-semibold text-white">
                {getInitials(user.fullName)}
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-blue-100 font-medium leading-tight">
                {user.fullName}
              </p>
              {isUserOnline(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-blue-300/70 text-xs">Offline</span>
              )}
            </div>

            {/* Unseen Messages Badge */}
            {unseenMessages[user._id] > 0 && (
              <span
                className="absolute top-3 right-3 text-xs h-5 w-5 flex items-center justify-center rounded-full bg-blue-600/50 border border-blue-300/30 text-blue-100 shadow-md shadow-blue-900/30"
                title={`${unseenMessages[user._id]} unread message(s)`}
                aria-label={`${unseenMessages[user._id]} unread messages`}
              >
                {unseenMessages[user._id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
