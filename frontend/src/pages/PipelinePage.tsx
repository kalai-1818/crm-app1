import React, { useState, useEffect } from "react";
import { leadService } from "../services/leadService.ts";
import { Kanban, Filter, Plus, Search, MoreVertical, Clock, Target } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STAGES = ["New", "Qualified", "Proposal Sent", "Negotiation", "Converted"];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const data = await leadService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getLeadsByStage = (stage: string) => {
    return leads.filter(l => l.pipelineStage === stage || (!l.pipelineStage && stage === "New"));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic uppercase">
            <Kanban className="w-8 h-8 text-orange-600" /> Lead <span className="text-orange-600">Pipeline</span>
          </h1>
          <p className="text-stone-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Velocity Tracking & Distribution</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded-xl bg-white border border-stone-200 text-stone-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter Grid
          </button>
          <button className="h-10 px-6 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20">
            <Plus className="w-4 h-4" /> New Acquisition
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[600px]">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-stone-100/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="h-[calc(100vh-240px)] flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {STAGES.map((stage) => {
            const stageLeads = getLeadsByStage(stage);
            const totalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div key={stage} className="min-w-[320px] flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">{stage}</span>
                    <span className="bg-stone-200 text-stone-600 text-[9px] font-black px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>
                  <span className="text-[10px] font-black text-orange-600 uppercase">₹{totalValue.toLocaleString()}</span>
                </div>

                <div className="flex-1 bg-stone-100/30 rounded-2xl p-3 border border-stone-200/50 space-y-3 overflow-y-auto custom-scrollbar">
                  {stageLeads.map((lead) => (
                    <motion.div
                      layoutId={lead.id}
                      key={lead.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 group hover:border-orange-500/50 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          lead.priority === 'High' ? 'bg-red-100 text-red-600' :
                          lead.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {lead.priority} Priority
                        </span>
                        <button className="text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-sm font-black text-stone-900 uppercase leading-snug group-hover:text-orange-600 transition-colors">{lead.name}</h3>
                      <p className="text-[10px] font-bold text-stone-400 mt-0.5">{lead.company || lead.email}</p>

                      <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-stone-400">
                          <Target className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black text-stone-900">₹{lead.value?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-tight">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {stageLeads.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">No active signals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
