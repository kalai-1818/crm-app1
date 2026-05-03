import React, { useState } from "react";
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Cloud,
  ChevronRight,
  Check
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService.ts";
import { useToast } from "../components/ui/Toast.tsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.tsx";

export default function SettingsPage() {
  const user = authService.getUser();
  const [activeTab, setActiveTab] = useState("Profile");
  const { toast } = useToast();
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const navigate = useNavigate();

  const handleSync = () => {
    toast("nibble profile synchronized successfully", "success");
  };

  const settingsTabs = [
    { name: "Profile", icon: <User className="w-4 h-4" /> },
    { name: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { name: "Security", icon: <Shield className="w-4 h-4" /> },
    { name: "Organization", icon: <Globe className="w-4 h-4" /> },
    { name: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { name: "Workspace", icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">nibble <span className="text-orange-600">Preferences.</span></h1>
          <p className="text-stone-500 text-sm mt-1 font-medium tracking-tight">System configuration and security management for your nibble workspace.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  activeTab === tab.name 
                    ? "bg-stone-900 text-white shadow-xl shadow-stone-900/10" 
                    : "hover:bg-stone-100 text-stone-500 hover:text-stone-900"
                }`}
              >
                <div className={activeTab === tab.name ? "text-orange-500" : "text-stone-400 group-hover:text-orange-600 transition-colors"}>
                  {tab.icon}
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-stone-200 rounded-[2.5rem] p-12 shadow-sm shadow-stone-900/5"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="w-14 h-14 bg-stone-50 border border-stone-200 rounded-[1.25rem] flex items-center justify-center text-stone-900 shadow-sm">
                {settingsTabs.find(t => t.name === activeTab)?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-stone-900">{activeTab} <span className="text-orange-600">Vector.</span></h2>
                <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mt-1">Configure {activeTab.toLowerCase()} parameters</p>
              </div>
            </div>

            {activeTab === "Profile" && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                  <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 bg-stone-100 rounded-[3rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-4 ring-stone-900/5 transition-transform hover:scale-105 active:scale-95">
                       <User className="w-12 h-12 text-stone-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                       <Palette className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-8 w-full">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 ml-1">Legal Identity</label>
                        <input 
                          defaultValue={user?.name}
                          className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-bold text-stone-900 focus:outline-none focus:border-orange-500 transition-all font-sans"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 ml-1">Neural Address</label>
                        <input 
                          defaultValue={user?.email}
                          className="w-full bg-stone-100 border border-stone-200 rounded-2xl py-4 px-6 text-sm font-bold text-stone-400 cursor-not-allowed font-sans"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 ml-1">Terminal Role</label>
                      <input 
                        placeholder="e.g. Lead Matrix Architect"
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-bold text-stone-900 focus:outline-none focus:border-orange-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex justify-end gap-6 border-t border-stone-100">
                  <button className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all">discard changes</button>
                  <button 
                    onClick={handleSync}
                    className="px-10 py-4 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/20 hover:bg-orange-600 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-4"
                  >
                    Synchronize Profile <Check className="w-4 h-4 text-orange-500" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Security" && (
                <div className="space-y-10">
                    <div className="p-8 bg-stone-50 rounded-3xl border border-stone-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-stone-900 uppercase tracking-tight">Multi-Factor Authentication</h3>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Enhance your nibble security layer</p>
                            </div>
                            <div className="w-12 h-6 bg-stone-200 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="h-[1px] bg-stone-100" />
                        <div className="flex items-center justify-between opacity-50 grayscale">
                            <div>
                                <h3 className="text-sm font-black text-stone-900 uppercase tracking-tight">Active Sessions</h3>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Manage concurrent terminal logins</p>
                            </div>
                            <button className="text-[8px] font-black uppercase tracking-widest border border-stone-300 px-3 py-1 rounded-lg">View All</button>
                        </div>
                    </div>
                    <div className="p-8 border border-red-100 bg-red-50/30 rounded-3xl space-y-4">
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Danger Vector</h3>
                        <button 
                          onClick={() => setIsTerminateOpen(true)}
                          className="w-full py-4 border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
                        >
                          TERMINATE ENTIRE ACCOUNT
                        </button>
                    </div>
                </div>
            )}

            {activeTab !== "Profile" && activeTab !== "Security" && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-100 shadow-inner">
                   <Cloud className="w-8 h-8 text-stone-200" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-stone-900 mb-2">nibble Node Locked.</h3>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 max-w-[280px] mx-auto leading-relaxed">
                  Advanced nibble interface protocols available in Enterprise Subscription tiers.
                </p>
                <button className="mt-8 px-8 py-3 bg-stone-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-stone-900/10">Upgrade Matrix</button>
              </div>
            )}
          </motion.div>
        </main>
      </div>
      <ConfirmDialog 
        isOpen={isTerminateOpen}
        onClose={() => setIsTerminateOpen(false)}
        onConfirm={() => {
          authService.logout();
          navigate("/login");
          toast("Account termination protocol initiated", "error");
        }}
        title="Terminate Account?"
        message="This will permanently delete your identity and all data in the nibble. This action is irreversible."
        confirmLabel="Terminate Identity"
      />
    </div>
  );
}
