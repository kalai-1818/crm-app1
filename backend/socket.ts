import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import Message from "./models/Message.ts";
import User from "./models/User.ts";
import Notification from "./models/Notification.ts";
import { auth } from "./config/firebase.ts";

const userRooms = new Map<string, string>();
let globalIo: Server | null = null;

export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  globalIo = io;

  // Authentication middleware: verify Firebase ID token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: No token provided"));
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const user = await User.findById(decodedToken.uid);
      if (!user) return next(new Error("Authentication error: User not found"));
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user;
    const userId: string = user._id || user.id;
    const userName: string = user.name;

    const privateRoom = `user_${userId}`;
    socket.join(privateRoom);
    socket.join("global_chat");
    userRooms.set(userId, privateRoom);

    console.log(`User connected: ${userName} (${socket.id})`);

    // Send last 50 messages as history
    try {
      const history = await Message.find({});
      socket.emit("chat_history", history.reverse());
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }

    socket.on("join_room", (room: string) => {
      socket.join(room);
    });

    socket.on("send_message", async (data: { text: string; room?: string }) => {
      if (!data.text?.trim()) return;
      const targetRoom = data.room || "global_chat";
      try {
        const newMessage = await Message.create({
          text: data.text,
          sender: userId,
          userName,
        });
        io.to(targetRoom).emit("new_message", newMessage);

        // Notify other connected users
        const otherUsers = await User.find({ _id: { $ne: userId } });
        for (const recipient of otherUsers) {
          const recipientId: string = (recipient as any)._id || (recipient as any).id;
          const notification = await Notification.create({
            recipient: recipientId,
            sender: userId,
            type: "MESSAGE_RECEIVED" as const,
            title: "New Message",
            message: `${userName}: ${data.text.substring(0, 50)}${data.text.length > 50 ? "..." : ""}`,
            link: "/chat",
          });
          io.to(`user_${recipientId}`).emit("notification", notification);
        }
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("typing", (data: { isTyping: boolean; room?: string }) => {
      const targetRoom = data.room || "global_chat";
      socket.to(targetRoom).emit("user_typing", { userId, userName, isTyping: data.isTyping });
    });

    socket.on("disconnect", () => {
      userRooms.delete(userId);
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const emitNotification = (recipientId: string, notification: any) => {
  if (globalIo) {
    globalIo.to(`user_${recipientId}`).emit("notification", notification);
  }
};

