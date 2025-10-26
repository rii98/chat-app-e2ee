import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import SimpleRSA from "../lib/rsa.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://chat-app-e2ee.onrender.com/api";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
         // 1. Generate RSA key pair
    const { publicKey, privateKey } = SimpleRSA.generateKeys();

    // 2. Convert them to string
    const stringifiedPublicKey = SimpleRSA.stringifyBigInt(publicKey);
    const stringifiedPrivateKey = SimpleRSA.stringifyBigInt(privateKey);

    // 3. Send signup request with publicKey only
      const res = await axiosInstance.post("/auth/signup", {
      ...data,
      publicKey: stringifiedPublicKey,
      });

      const user = res.data; // backend response: { _id, fullName, email, profilePic, publicKey }

    // 4. Store private keys per user in localStorage
      const storedKeys = JSON.parse(localStorage.getItem("privateKeys") || "{}");
      storedKeys[user._id] = stringifiedPrivateKey; // use user._id as key
      localStorage.setItem("privateKeys", JSON.stringify(storedKeys));

      // const storedPrivateKeys = JSON.parse(localStorage.getItem("privateKeys") || "{}");
      // storedPrivateKeys[user._id] = stringifiedPrivateKey;
      // localStorage.setItem("privateKeys", JSON.stringify(storedPrivateKeys));
  
  
      // // 5. Store public key separately in localStorage
      // const storedPublicKeys = JSON.parse(localStorage.getItem("publicKeys") || "{}");
      // storedPublicKeys[user._id] = stringifiedPublicKey;
      // localStorage.setItem("publicKeys", JSON.stringify(storedPublicKeys));

      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
