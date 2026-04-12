/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

// eslint-disable-next-line react-refresh/only-export-components
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios, authUser, loading } = useContext(AuthContext);

  // Fetch all users for sidebar
  const getUsers = async () => {
    if (!authUser) return;
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Fetch messages for selected user
  const getMessages = async (userId) => {
    if (!authUser || !userId) return;
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Send message to selected user
  const sendMessage = async (messageData) => {
    if (!authUser) {
      toast.error("Please login to send messages");
      return;
    }
    if (!selectedUser) {
      toast.error("Select a user to send message");
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Clear unseen count for selected user when opened
  useEffect(() => {
    if (selectedUser) {
      setUnseenMessages((prev) => {
        const newUnseen = { ...prev };
        delete newUnseen[selectedUser._id];
        return newUnseen;
      });
    }
  }, [selectedUser]);

  // Subscribe to new messages
  useEffect(() => {
    if (!socket) return;

    const handler = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseen) => ({
          ...prevUnseen,
          [newMessage.senderId]: (prevUnseen[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handler);

    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, selectedUser, axios]);

  // Fetch users only after auth state is resolved
  useEffect(() => {
    if (loading) return;

    if (authUser) {
      getUsers();
    } else {
      setUsers([]);
      setMessages([]);
      setSelectedUser(null);
      setUnseenMessages({});
    }
  }, [loading, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
