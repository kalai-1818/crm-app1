import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  User as UserIcon,
  Minimize2,
  Maximize2,
  Sparkles,
  Bot
} from "lucide-react";
import { authService } from "../services/authService.ts";
import { aiService, AIMessage } from "../services/aiService.ts";
import ReactMarkdown from 'react-markdown';

export default function ChatPanel() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'ai'>('team');
  
  // Team Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  // AI Assistant State
  const [aiMessages, setAiMessages] = useState<any[]>([
    { 
      role: 'model', 
      parts: [{ text: "Nexus Intelligence online. How can I facilitate your CRM operations today?" }],
      createdAt: new Date().toISOString()
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = authService.getUser();
    setCurrentUser(user);

    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);

    if (isOpen && activeTab === 'team' && !socketRef.current) {
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
      window.removeEventListener('open-chat', handleOpenChat);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const typingTimeoutRef = useRef<any>(null);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (activeTab === 'team') {
      if (!socketRef.current) return;
      socketRef.current.emit("send_message", { text: inputValue });
      socketRef.current.emit("typing", { isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setInputValue("");
    } else {
      const userMessage = { 
        role: 'user', 
        parts: [{ text: inputValue }],
        createdAt: new Date().toISOString()
      };
      
      setAiMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setIsAiTyping(true);

      try {
        const history: AIMessage[] = aiMessages.map(msg => ({
          role: msg.role,
          parts: msg.parts
        }));

        const context = `The user is currently on page: ${location.pathname}.`;
        const responseText = await aiService.chat(userMessage.parts[0].text, history, context);
        
        setAiMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: responseText }],
          createdAt: new Date().toISOString()
        }]);
      } catch (err) {
        setAiMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: "Apologies. Matrix synchronization failure. Please try again." }],
          createdAt: new Date().toISOString()
        }]);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  if (!isOpen || location.pathname === "/chat") {
    if (location.pathname === "/chat" && isOpen) setIsOpen(false);
    
    if (location.pathname === "/chat") return null;

    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[200] w-16 h-16 bg-orange-600 text-white rounded-2xl shadow-2xl shadow-orange-200 flex items-center justify-center hover:scale-105 transition-all hover:bg-orange-700"
      >
        <MessageSquare className="w-7 h-7" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[200] w-[400px] h-[600px] bg-white border border-[#E7E5E4] rounded-3xl shadow-2xl flex flex-col overflow-hidden overflow-hidden"
      >
        <div className="p-0 border-b border-[#E7E5E4] bg-[#1C1917] text-white flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-bold">
                {activeTab === 'team' ? <MessageSquare className="w-5 h-5" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight line-clamp-1">
                  {activeTab === 'team' ? <>Team <span className="text-orange-600">Sync.</span></> : <>Nexus <span className="text-orange-600">Intelligence.</span></>}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'ai' ? 'bg-orange-500 animate-pulse' : (isConnected ? 'bg-green-500' : 'bg-red-500')}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {activeTab === 'ai' ? 'Neural Link Active' : (isConnected ? 'Online' : 'Reconnecting...')}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex border-t border-white/5">
            <button 
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'text-orange-500 bg-white/5' : 'text-stone-500 hover:text-stone-300'}`}
            >
              Team Grid
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'text-orange-500 bg-white/5' : 'text-stone-500 hover:text-stone-300'} flex items-center justify-center gap-2`}
            >
              <Sparkles className="w-3 h-3" /> Assistant
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAF9] custom-scrollbar">
          {activeTab === 'team' ? (
            <>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest leading-loose">
                    Beginning of time.<br />Say something to the team.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender === currentUser?.id;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg._id || i} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-[#A8A29E] mb-1.5 ml-1 flex items-center gap-1">
                        <UserIcon className="w-2.5 h-2.5" /> {msg.userName}
                      </span>
                    )}
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-orange-600 text-white rounded-tr-none' 
                        : 'bg-white border border-[#E7E5E4] text-[#1C1917] rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-bold text-[#A8A29E] mt-1.5 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest italic opacity-70">
                    {Object.values(typingUsers).join(", ")} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} holographic typing...
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {aiMessages.map((msg, i) => {
                const isMe = msg.role === 'user';
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-black text-orange-600 mb-1.5 ml-1 flex items-center gap-1 uppercase tracking-widest">
                        <Bot className="w-2.5 h-2.5" /> Nexus Intelligence
                      </span>
                    )}
                    <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-[#1C1917] text-white rounded-tr-none font-bold' 
                        : 'bg-white border border-[#E7E5E4] text-[#1C1917] rounded-tl-none prose-sm prose-stone'
                    }`}>
                      <ReactMarkdown>{msg.parts?.[0]?.text || ""}</ReactMarkdown>
                    </div>
                    <span className="text-[9px] font-bold text-[#A8A29E] mt-1.5 px-1 uppercase tracking-widest italic">
                      {isMe ? 'Identity Verified' : 'Neural Response'}
                    </span>
                  </motion.div>
                );
              })}
              {isAiTyping && (
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  </div>
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] animate-pulse">
                    Analyzing Core Data...
                  </span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-[#E7E5E4] bg-white">
          <div className="relative group">
            <input 
              required
              value={inputValue}
              onChange={handleInputChange}
              placeholder={activeTab === 'team' ? "Message Nexus team..." : "Query Nexus Intelligence..."}
              className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-orange-500 transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || (activeTab === 'ai' && isAiTyping)}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1C1917] text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-30 disabled:hover:bg-[#1C1917]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-[#A8A29E] text-center mt-3 font-bold uppercase tracking-widest">
            {activeTab === 'team' ? 'Broadcasting to team grid' : 'Direct neural query'}
          </p>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
