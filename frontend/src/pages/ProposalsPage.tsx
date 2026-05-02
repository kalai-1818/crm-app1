import React, { useState, useEffect } from "react";
import { proposalService } from "../services/proposalService.ts";
import { FileText, Plus, Search, Calendar, User, ExternalLink, Download } from "lucide-react";
import { motion } from "motion/react";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      const data = await proposalService.getProposals();
      setProposals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic uppercase text-stone-900">
            <FileText className="w-8 h-8 text-orange-600" /> Sales <span className="text-orange-600">Proposals</span>
          </h1>
          <p className="text-stone-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Contract Generation & Archive</p>
        </div>
        <button className="h-10 px-6 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20">
          <Plus className="w-4 h-4" /> Create Proposal
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
          ))
        ) : proposals.length > 0 ? (
          proposals.map((proposal) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={proposal.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-orange-600 transition-colors border border-stone-100 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase">Proposal: {proposal.id.substring(0, 8)}</h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1">
                    <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5 uppercase">
                      <Calendar className="w-3 h-3" /> {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5 uppercase">
                      <User className="w-3 h-3" /> LeadRef: {proposal.leadId.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total Value</p>
                  <p className="text-lg font-black text-stone-900">₹{proposal.pricing?.total?.toLocaleString()}</p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  proposal.status === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                  proposal.status === 'Sent' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                  'bg-stone-50 text-stone-500 border-stone-100'
                }`}>
                  {proposal.status}
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all" title="View Document">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200">
            <FileText className="w-12 h-12 text-stone-100 mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-stone-400">No active proposals in archive</p>
          </div>
        )}
      </div>
    </div>
  );
}
