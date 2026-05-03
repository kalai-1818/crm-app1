import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Send, 
  User as UserIcon,
  Search,
  Users
} from "lucide-react";
import { authService } from "../services/authService.ts";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const user = authService.getUser();
    setCurrentUser(user);

    if (!socketRef.current) {
      const socket = io({
        auth: {
          token: authService.getToken()
        }
      });

      socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("join_room", "global_chat");
      });

      socket.on("chat_history", (history: any[]) => {
        setMessages(history);
      });

      socket.on("new_message", (message: any) => {
        setMessages(prev => [...prev, message]);
        // Clear typing indicator for this user
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[message.sender];
          return next;
        });
      });

      socket.on("user_typing", (data: { userId: string, userName: string, isTyping: boolean }) => {
        setTypingUsers(prev => {
          const next = { ...prev };
          if (data.isTyping) {
            next[data.userId] = data.userName;
          } else {
            delete next[data.userId];
          }
          return next;
        });
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit("typing", { isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", { isTyping: false });
      }, 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", { text: inputValue });
    socketRef.current.emit("typing", { isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setInputValue("");
  };

  return (
    <div className="h-full flex bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xl shadow-stone-900/5">
      {/* Threads Sidebar */}
      <div className="w-80 border-r border-stone-100 flex flex-col bg-stone-50/50">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-black tracking-tight text-stone-900">nibble <span className="text-orange-600">Comms.</span></h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search threads..." 
              className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-stone-400 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button className="w-full flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-2xl shadow-sm group">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-orange-900/20">#</div>
            <div className="flex-1 text-left">
              <p className="text-xs font-black text-stone-900 tracking-tight">global_workspace</p>
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-0.5">Active nibble</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
          </button>
          {["analytics-feed", "system-logs", "design-sync"].map(thread => (
            <button key={thread} className="w-full flex items-center gap-3 p-3 hover:bg-stone-100/50 rounded-2xl transition-all group">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 font-black text-xs">#</div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-stone-500 tracking-tight group-hover:text-stone-900 transition-colors uppercase tracking-widest">{thread}</p>
                <p className="text-[9px] text-stone-300 font-bold uppercase tracking-widest mt-0.5">LOCKED</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-stone-100">
          <div className="bg-stone-900 text-white p-3 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-stone-700 flex items-center justify-center text-[10px] font-black">{currentUser?.name?.charAt(0) || "U"}</div>
             <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black tracking-tight truncate">{currentUser?.email}</p>
                <p className="text-[8px] text-stone-500 font-black uppercase tracking-widest leading-none">TERMINAL ACTIVE</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-stone-100 rounded-xl border border-stone-200">
              <Users className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-stone-900"># global_workspace</h1>
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-orange-500 animate-pulse ring-4 ring-orange-500/10' : 'bg-stone-300'}`} />
              </div>
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mt-0.5">Collective Intelligence Exchange</p>
            </div>
          </div>
          <div className="flex -space-x-1 hover:space-x-1 transition-all">
             {[1,2,3].map(i => (
               <div key={i} className="w-7 h-7 rounded-lg border-2 border-white bg-stone-100 flex items-center justify-center text-[9px] font-black text-stone-400 shadow-sm">
                 U{i}
               </div>
             ))}
             <div className="w-7 h-7 rounded-lg border-2 border-white bg-orange-600 flex items-center justify-center text-[9px] font-black text-white shadow-sm">+</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center text-stone-200 mb-6 border border-stone-200">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-stone-900">Workspace Empty</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-2 max-w-[240px] leading-relaxed">
                Awaiting first transmission to synchronize team velocity.
              </p>
            </div>
          )}
          
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => {
              const isMe = msg.sender === currentUser?.id;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg._id || i} 
                  className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm ${isMe ? 'bg-stone-900 text-white' : 'bg-orange-600 text-white'}`}>
                    {msg.userName?.charAt(0) || "U"}
                  </div>
                  <div className={`max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {!isMe && <span className="text-[10px] font-black text-stone-900 uppercase tracking-tight">{msg.userName}</span>}
                      <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-4 text-xs font-semibold leading-relaxed shadow-md ${
                      isMe 
                        ? 'bg-stone-900 text-white rounded-2xl rounded-tr-none' 
                        : 'bg-white border border-stone-100 text-stone-900 rounded-2xl rounded-tl-none ring-4 ring-stone-900/5'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {Object.keys(typingUsers).length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-12"
            >
              <div className="flex gap-0.5">
                {[0.1, 0.2, 0.3].map(d => (
                  <div key={d} className="w-1 h-1 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
              <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest opacity-60">
                nibble processing input...
              </span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-stone-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
            <div className="relative flex-1 group">
              <input 
                required
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Synchronize a message..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-5 px-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all text-stone-900 placeholder:text-stone-300"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 opacity-30 group-focus-within:opacity-100 transition-opacity">
                <kbd className="text-[8px] font-black border border-stone-200 px-1.5 py-0.5 rounded uppercase tracking-widest bg-white">Enter</kbd>
              </div>
            </div>
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className={`px-8 rounded-2xl flex items-center justify-center transition-all ${
                inputValue.trim() 
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-stone-100 text-stone-300 opacity-50 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-4">
             <div className="h-[1px] w-12 bg-stone-100" />
             <p className="text-[8px] font-black text-stone-300 uppercase tracking-[0.4em]">Secure nibble Protocol v1.4</p>
             <div className="h-[1px] w-12 bg-stone-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
