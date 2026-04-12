/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Global axios defaults
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // if using cookies / cross-site auth

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  // Helper: set axios token header
  const applyTokenToAxios = (tk) => {
    if (tk) {
      axios.defaults.headers.common["token"] = tk;
      axios.defaults.headers.common["Authorization"] = `Bearer ${tk}`;
    } else {
      delete axios.defaults.headers.common["token"];
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Check auth status on load
  const checkAuth = async () => {
    setLoading(true);
    try {
      if (token) applyTokenToAxios(token);

      const { data } = await axios.get("/api/auth/check");
      if (data?.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      // Show server messages only if present
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login / Signup wrapper
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data?.success) {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          applyTokenToAxios(data.token);
        }

        const user = data.userData || data.user;
        setAuthUser(user);
        connectSocket(user);

        toast.success(data.message || "Logged in");
        return { success: true, data };
      } else {
        toast.error(data?.message || "Authentication failed");
        return { success: false, data };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return { success: false, error };
    }
  };

  // Logout
  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      applyTokenToAxios(null);
      setAuthUser(null);
      setOnlineUser([]);

      if (socketRef.current) {
        try {
          socketRef.current.off();
          socketRef.current.disconnect();
        } catch {
          // ignore cleanup errors
        }
        socketRef.current = null;
      }
      setSocket(null);

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data?.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
        return { success: true, data };
      } else {
        toast.error(data?.message || "Update failed");
        return { success: false, data };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return { success: false, error };
    }
  };

  // Socket connection
  const connectSocket = (userData) => {
    if (!userData) return;

    // prevent multiple connects
    if (socketRef.current && socketRef.current.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      withCredentials: true,
      autoConnect: false,
    });

    // cleanup previous
    if (socketRef.current) {
      try {
        socketRef.current.off();
        socketRef.current.disconnect();
      } catch {
        // ignore
      }
      socketRef.current = null;
    }

    newSocket.connect();

    newSocket.on("connect", () => {
      // optionally log newSocket.id
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUser(Array.isArray(userIds) ? userIds : []);
    });

    // remove unused param to avoid ESLint unused-var
    newSocket.on("disconnect", () => {
      // socket disconnected
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.off();
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }
    };
  }, []);

  // Run checkAuth on load and when token changes
  useEffect(() => {
    if (token) applyTokenToAxios(token);
    checkAuth();
  }, [token]);

  const value = {
    axios,
    authUser,
    onlineUser,
    socket,
    loading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
