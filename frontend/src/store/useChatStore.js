import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import SimpleRSA from "../lib/rsa";
import AESUtil from "../lib/aes";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
//no e2ee version
  // getMessages: async (userId) => {
  //   set({ isMessagesLoading: true });
  //   try {
  //     const res = await axiosInstance.get(`/messages/${userId}`);
  //     set({ messages: res.data });
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   } finally {
  //     set({ isMessagesLoading: false });
  //   }
  // },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messages = res.data;
  
      // Get current user's private key from localStorage
      const privateKeysJson = localStorage.getItem("privateKeys");
      if (!privateKeysJson) {
        toast.error("No private keys found in local storage.");
        set({ messages });
        return;
      }
  
      const privateKeys = JSON.parse(privateKeysJson);
      const currentUserId = useAuthStore.getState().authUser._id;
      const privateKeyString = privateKeys[currentUserId];
      if (!privateKeyString) {
        toast.error("Private key not found for current user.");
        set({ messages });
        return;
      }
  
      const privateKey = SimpleRSA.parseBigInt(privateKeyString);
  
      // Decrypt each message
      const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
         
          if (msg.text && msg.text.cipherText && msg.text.encryptedAESKey) {
            try {
              // 1️⃣ Decrypt AES key using user's private RSA key

              console.log(msg.text.encryptedAESKey);
              console.log(privateKey);
              const aesKey = SimpleRSA.decrypt(msg.text.encryptedAESKey, privateKey);
  
         
              // 2️⃣ Decrypt message using AES key
              
              const plainText = await AESUtil.decrypt(msg.text.cipherText, aesKey);
              
              return { ...msg, text: plainText };
            } catch (error) {
              console.error("Decryption failed for message", msg._id, error);
              return { ...msg, text: "Decryption failed" };
            }
          }
          return msg; // return message as is if no text
        })
      );
  
      set({ messages: decryptedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    //messageData {
      //   text: text.trim(),
      //   image: imagePreview,
      // }
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    //get the public key of selected user
    const selectedUserPublicKey = selectedUser?.publicKey;
    if(!selectedUserPublicKey){
      toast.error("No public key for selected user.");
      return;
    }
    const {text,image} = messageData;
    let newMessageData = {};
    //use aes and rsa here
    try {
      let cipherText = null;
    let encryptedAESKey = null;

    if (text) {
      // 1️ Generate a random AES key
      const aesKey = await AESUtil.generateKey();

      // 2️ Encrypt the text with AES key
      cipherText = await AESUtil.encrypt(text, aesKey);

      // 3️ Encrypt the AES key with receiver's RSA public key
          // 3️⃣ Encrypt AES key for receiver
          const receiverPublicKey = SimpleRSA.parseBigInt(selectedUser.publicKey);
          const encryptedAESKeyForReceiver = SimpleRSA.encrypt(aesKey, receiverPublicKey);
    
          // 4️⃣ Encrypt AES key for sender
          const senderPublicKey = SimpleRSA.parseBigInt(authUser.publicKey);
          const encryptedAESKeyForSender = SimpleRSA.encrypt(aesKey, senderPublicKey);
    
          // 5️⃣ Construct the message payload
          newMessageData = {
            text: {
              cipherText,
              encryptedAESKeys: {
                sender: encryptedAESKeyForSender,
                receiver: encryptedAESKeyForReceiver,
              },
            },
            image: image || null,
          };
    }
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, newMessageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
