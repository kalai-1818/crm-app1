import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  Users, 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  Search,
  ChevronLeft,
  Menu,
  User as UserIcon,
  X,
  Clock,
  ExternalLink,
  ChevronRight,
  Circle,
  Loader2,
  TrendingUp,
  Kanban,
  FileText,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { authService } from "../services/authService.ts";
import { notificationService } from "../services/notificationService.ts";
import { socketService } from "../services/socketService.ts";
import { searchService, SearchResult } from "../services/searchService.ts";
import ChatPanel from "./ChatPanel.tsx";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socketService.connect().then(socket => {
  socket.on("notification", (notification: any) => {
    setNotifications(prev => [notification, ...prev]);
  });
}).catch(err => console.warn('Socket connect error:', err));

return () => {
  const socket = socketService.getSocket();
  if (socket) socket.off("notification");
};
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults(null);
        setIsSearchOpen(false);
        return;
      }

      setIsSearching(true);
      setIsSearchOpen(true);
      try {
        const results = await searchService.globalSearch(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/" },
    { icon: <Target className="w-5 h-5" />, label: "Leads", path: "/leads" },
    { icon: <Kanban className="w-5 h-5" />, label: "Pipeline", path: "/pipeline" },
    { icon: <FileText className="w-5 h-5" />, label: "Proposals", path: "/proposals" },
    { icon: <Briefcase className="w-5 h-5" />, label: "Projects", path: "/projects" },
    { icon: <CheckSquare className="w-5 h-5" />, label: "Tasks", path: "/tasks" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Team Sync", path: "/chat" },
  ];

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="h-full bg-stone-950 text-white flex flex-col relative z-[60] shadow-2xl overflow-hidden"
      >
        {/* Sidebar Header / Workspace Switcher */}
        <div className="p-4 flex items-center h-20 border-b border-white/5 relative overflow-hidden group">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/50 z-10 transition-transform group-hover:scale-110">
            <Users className="text-white w-6 h-6" />
          </div>
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 z-10 whitespace-nowrap"
              >
                <p className="font-black text-lg tracking-tight leading-none">Nexus<span className="text-orange-500">Workspace</span></p>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Free Tier</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center h-11 px-3 rounded-lg transition-all group relative ${
                  isActive 
                    ? "text-white" 
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`shrink-0 z-10 transition-colors ${isActive ? "text-orange-500" : "group-hover:text-white"}`}>
                  {item.icon}
                </div>
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-semibold text-sm tracking-tight z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full z-20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link 
            to="/settings"
            className={`flex items-center h-11 px-3 rounded-lg transition-all group relative ${
              location.pathname === "/settings" 
                ? "text-white" 
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <SettingsIcon className={`w-5 h-5 shrink-0 z-10 ${location.pathname === "/settings" ? "text-orange-500" : ""}`} />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 font-semibold text-sm whitespace-nowrap z-10"
                >
                  Workspace Settings
                </motion.span>
              )}
            </AnimatePresence>
            {location.pathname === "/settings" && (
              <motion.div 
                layoutId="activeNavBackground"
                className="absolute inset-0 bg-white/10 rounded-lg"
              />
            )}
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center h-11 px-3 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all outline-none group"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 font-semibold text-sm whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform z-[70] border-2 border-stone-950"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 z-50 shadow-sm shadow-stone-900/5">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input 
                id="global-search-input"
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                placeholder="Find anything (⌘+K)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-1.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
              />

              <AnimatePresence>
                {isSearchOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSearchOpen(false)}
                      className="fixed inset-0 z-40 bg-stone-900/5 backdrop-blur-[2px]"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute left-0 top-full mt-2 w-[480px] bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 flex flex-col gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {isSearching ? (
                          <div className="py-12 text-center text-stone-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Scanning Grid...</p>
                          </div>
                        ) : searchResults && (
                          <>
                            {searchResults.leads.length > 0 && (
                              <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 px-2 flex items-center gap-2">
                                  <Target className="w-3 h-3" /> Leads
                                </h3>
                                <div className="space-y-1">
                                  {searchResults.leads.map(lead => (
                                    <button 
                                      key={lead._id}
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        navigate(`/leads`); // Future: Lead detail modal
                                      }}
                                      className="w-full text-left p-3 rounded-xl hover:bg-stone-50 group flex items-center justify-between"
                                    >
                                      <div>
                                        <p className="text-xs font-black text-stone-900 group-hover:text-orange-600 transition-colors uppercase">{lead.name}</p>
                                        <p className="text-[10px] text-stone-400 font-bold">{lead.company || lead.email}</p>
                                      </div>
                                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{lead.status}</span>
                                    </button>
                                  ))}
                                </div>
                              </section>
                            )}

                            {searchResults.tasks.length > 0 && (
                              <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 px-2 flex items-center gap-2">
                                  <CheckSquare className="w-3 h-3" /> Tasks
                                </h3>
                                <div className="space-y-1">
                                  {searchResults.tasks.map(task => (
                                    <button 
                                      key={task._id}
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        navigate(`/tasks`);
                                      }}
                                      className="w-full text-left p-3 rounded-xl hover:bg-stone-50 group"
                                    >
                                      <p className="text-xs font-black text-stone-900 group-hover:text-orange-600 transition-colors uppercase italic line-clamp-1">"{task.title}"</p>
                                      <p className="text-[10px] text-stone-400 font-bold line-clamp-1">{task.description}</p>
                                    </button>
                                  ))}
                                </div>
                              </section>
                            )}

                            {searchResults.users.length > 0 && (
                              <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 px-2 flex items-center gap-2">
                                  <UserIcon className="w-3 h-3" /> Operatives
                                </h3>
                                <div className="space-y-1">
                                  {searchResults.users.map(user => (
                                    <div key={user._id} className="p-3 rounded-xl flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-[10px] font-black uppercase">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-stone-900 leading-none">{user.name}</p>
                                        <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-0.5">{user.role}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}

                            {searchResults.leads.length === 0 && searchResults.tasks.length === 0 && searchResults.users.length === 0 && (
                              <div className="py-12 text-center">
                                <Search className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">System scan complete. No signals found.</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="p-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                         <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest">Global Index Multi-Scan</span>
                         <span className="text-[8px] font-black text-stone-300 uppercase">ESC to close</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-lg transition-all relative ${isNotificationsOpen ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-orange-600 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in duration-300">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-2xl shadow-stone-900/10 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-stone-50">
                            {notifications.map((n) => (
                              <div 
                                key={n._id || Math.random()} 
                                className={`p-4 hover:bg-stone-50 transition-all group relative cursor-pointer ${!n.isRead ? 'bg-orange-50/30' : ''}`}
                                onClick={() => {
                                  if (!n.isRead) handleMarkAsRead(n._id);
                                  if (n.link) navigate(n.link);
                                  setIsNotificationsOpen(false);
                                }}
                              >
                                {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-full" />}
                                <div className="flex gap-3">
                                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                                    n.type === 'LEAD_ASSIGNED' ? 'bg-green-100 text-green-600' :
                                    n.type === 'TASK_UPDATED' ? 'bg-blue-100 text-blue-600' :
                                    n.type === 'MESSAGE_RECEIVED' ? 'bg-orange-100 text-orange-600' :
                                    'bg-stone-100 text-stone-600'
                                  }`}>
                                    {n.type === 'LEAD_ASSIGNED' ? <Target className="w-4 h-4" /> :
                                     n.type === 'TASK_UPDATED' ? <CheckSquare className="w-4 h-4" /> :
                                     n.type === 'MESSAGE_RECEIVED' ? <MessageSquare className="w-4 h-4" /> :
                                     <Bell className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-stone-900 group-hover:text-orange-600 transition-colors truncate">{n.title}</p>
                                    <p className="text-[10px] text-stone-500 font-medium mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                    <p className="text-[8px] text-stone-400 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-stone-100 shadow-inner">
                              <Bell className="w-4 h-4 text-stone-200" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">No Notifications</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t border-stone-100 text-center bg-stone-50/30">
                        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-all flex items-center justify-center gap-2 mx-auto">
                          View All Activity <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-6 w-px bg-stone-200 mx-1" />

            <button className="flex items-center gap-2.5 p-1.5 pr-2.5 hover:bg-stone-50 rounded-xl transition-all group">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-stone-900/10 transition-transform group-hover:scale-105">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold tracking-tight leading-tight">{user?.name || "User"}</p>
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest leading-none mt-0.5">Admin Account</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative bg-stone-50/50 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          <ChatPanel />
        </main>
      </div>
    </div>
  );
}
