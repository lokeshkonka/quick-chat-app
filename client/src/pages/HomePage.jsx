import React, { useContext } from "react";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

function HomePage() {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%] bg-gradient-to-br from-black via-blue-950 to-black">
      <div
        role="main"
        className={`backdrop-blur-2xl bg-black/40 border border-blue-400/20 rounded-2xl overflow-hidden h-full shadow-2xl shadow-blue-900/20 grid grid-cols-1 relative
          ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-2"
          }`}
      >
        <SideBar />
        <ChatContainer />
        <RightSidebar selectedUser={selectedUser} />
      </div>
    </div>
  );
}

export default HomePage;
