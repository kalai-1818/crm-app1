import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Target,
  Plus, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Building2, 
  LogOut,
  X,
  Loader2,
  Trash2,
  ChevronDown,
  Clock
} from "lucide-react";
import { authService } from "../services/authService.ts";
import { leadService } from "../services/leadService.ts";
import { useToast } from "../components/ui/Toast.tsx";
import { Skeleton, TableRowSkeleton } from "../components/ui/Skeleton.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.tsx";
import { LeadTimeline } from "../components/LeadTimeline.tsx";

const STATUS_COLORS: any = {
  'New': 'bg-blue-50 text-blue-700 border-blue-100',
  'Contacted': 'bg-orange-50 text-orange-700 border-orange-100',
  'Converted': 'bg-green-50 text-green-700 border-green-100',
  'Rejected': 'bg-red-50 text-red-700 border-red-100'
};

const PRIORITY_COLORS: any = {
  'High': 'bg-rose-50 text-rose-600 border-rose-100',
  'Medium': 'bg-stone-50 text-stone-600 border-stone-200',
  'Low': 'bg-stone-50 text-stone-300 border-stone-100'
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', status: 'New', value: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchActivities = async (id: string) => {
    setIsLoadingActivities(true);
    try {
      const data = await leadService.getActivities(id);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setNewLead({
      name: lead.name,
      email: lead.email,
      company: lead.company || '',
      status: lead.status,
      value: lead.value || 0
    });
    setIsModalOpen(true);
    fetchActivities(lead._id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    setActivities([]);
    setNewLead({ name: '', email: '', company: '', status: 'New', value: 0 });
  };

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leadService.getLeads();
setLeads(Array.isArray(data) ? data : data.leads || []);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const search = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(search) || 
      lead.email.toLowerCase().includes(search) || 
      (lead.company && lead.company.toLowerCase().includes(search))
    );
  });

  const handleCreateOrUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingLead) {
        const updated = await leadService.updateLead(editingLead._id, newLead);
        setLeads(leads.map(l => l._id === editingLead._id ? updated : l));
        toast('Lead matrix updated successfully', 'success');
      } else {
        const lead = await leadService.createLead(newLead);
        setLeads([lead, ...leads]);
        toast('Lead successfully synchronized with the nibble', 'success');
      }
      handleCloseModal();
    } catch (err) {
      toast('Operation protocol failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = await leadService.updateLead(id, { status });
      setLeads(leads.map(l => l._id === id ? updated : l));
      toast(`Status updated to ${status}`, 'success');
    } catch (err) {
      toast('Status update failed', 'error');
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await leadService.deleteLead(id);
      setLeads(leads.filter(l => l._id !== id));
      toast('Lead record terminated successfully', 'success');
    } catch (err) {
      toast('Protocol failure during termination', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Lead <span className="text-orange-600">nibble.</span></h1>
          <p className="text-stone-500 text-sm mt-1 font-medium tracking-tight">Managing {leads.length} active relationships across your network.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm">
            <MoreHorizontal className="w-3.5 h-3.5" /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl flex items-center justify-between text-xs font-bold"
        >
          <div className="flex items-center gap-3">
            <X className="w-4 h-4" onClick={() => setError(null)} />
            {error}
          </div>
          <button onClick={fetchLeads} className="underline uppercase tracking-widest">Retry Sync</button>
        </motion.div>
      )}

      {/* Table Controls */}
      <div className="bg-white border border-stone-200 rounded-2xl p-2.5 flex flex-col md:flex-row gap-2.5 items-center justify-between shadow-sm shadow-stone-900/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search nibble records..." 
            className="w-full bg-stone-50 border border-stone-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none h-10 border border-stone-200 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> All Status
          </button>
          <button className="flex-1 md:flex-none h-10 border border-stone-200 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-colors">
             Sort: Newest
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm shadow-stone-900/5 min-h-[400px]">
        {isLoading ? (
          <div className="divide-y divide-stone-50">
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="w-[30%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Personnel & Organization</th>
                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Status Vector</th>
                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Est. Value</th>
                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Priority</th>
                  <th className="w-[25%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredLeads.map((lead) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={lead._id} 
                    className="group hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-stone-900/10 transition-transform group-hover:scale-105">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm tracking-tight truncate">{lead.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                            <Building2 className="w-2.5 h-2.5" />
                            <span className="truncate">{lead.company || 'Private Agent'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDropdown 
                        currentStatus={lead.status} 
                        onUpdate={(status) => handleUpdateStatus(lead._id, status)} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-stone-900">
                        ${(lead.value || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${PRIORITY_COLORS[lead.priority || 'Medium']}`}>
                        {lead.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a 
                          href={`mailto:${lead.email}`} 
                          title="Contact via Email"
                          className="p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleEditLead(lead)}
                          title="Lead Intelligence"
                          className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(lead._id)}
                          title="Terminate Record"
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="nibble Depleted." 
            description="No records match your scan parameters in the current system state."
            icon={<Target className="text-stone-200 w-8 h-8" />}
            action={
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-900/10"
              >
                <Plus className="w-4 h-4" /> Create Record
              </button>
            }
          />
        )}
      </div>

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteLead(deleteConfirmId)}
        title="Terminate Lead?"
        message="This action will permanently erase the record from the nibble."
        confirmLabel="Terminate"
      />

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-stone-200 flex flex-col md:flex-row h-full max-h-[85vh]"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1 px-0">
                <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/30 sticky top-0 bg-white z-10">
                  <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">
                      {editingLead ? <><span className="text-stone-400">Operative</span> Profile.</> : <>nibble <span className="text-orange-600">Registration.</span></>}
                    </h2>
                    {editingLead && <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Intelligence Protocol Active</p>}
                  </div>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateOrUpdateLead} className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Full Identity</label>
                        <input 
                          required 
                          value={newLead.name}
                          onChange={e => setNewLead({...newLead, name: e.target.value})}
                          type="text" 
                          className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                          placeholder="e.g. Alexander Pierce"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Communication Endpoint</label>
                        <input 
                          required 
                          value={newLead.email}
                          onChange={e => setNewLead({...newLead, email: e.target.value})}
                          type="email" 
                          className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                          placeholder="alex@nibble.io"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Corporate Entity</label>
                        <input 
                          value={newLead.company}
                          onChange={e => setNewLead({...newLead, company: e.target.value})}
                          type="text" 
                          className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                          placeholder="nibble Systems"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Est. Vector Value (USD)</label>
                        <input 
                          value={newLead.value}
                          onChange={e => setNewLead({...newLead, value: Number(e.target.value)})}
                          type="number" 
                          className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-6">
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Status Alignment</p>
                       <div className="flex gap-2">
                        {['New', 'Contacted', 'Converted', 'Rejected'].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewLead({...newLead, status: s})}
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                              newLead.status === s 
                                ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/10' 
                                : 'bg-white text-stone-400 border-stone-100 hover:bg-stone-50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                       </div>
                    </div>
                    <div className="pt-4 shrink-0 min-w-[200px]">
                      <button 
                        disabled={isSubmitting}
                        className="w-full bg-stone-900 text-white py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 shadow-xl shadow-stone-900/10"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{editingLead ? 'Update Profile' : 'Synchronize Record'} <Plus className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {editingLead && (
                <div className="w-full md:w-[320px] bg-stone-50/50 border-l border-stone-100 p-8 overflow-y-auto custom-scrollbar">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-8 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Signal Timeline
                   </h3>
                   <LeadTimeline activities={activities} />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusDropdown({ currentStatus, onUpdate }: { currentStatus: string, onUpdate: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ['New', 'Contacted', 'Converted', 'Rejected'];
  
  const colors: any = {
    'New': 'bg-stone-50 text-stone-600 border-stone-200',
    'Contacted': 'bg-orange-50 text-orange-600 border-orange-200',
    'Converted': 'bg-green-50 text-green-600 border-green-200',
    'Rejected': 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group ${colors[currentStatus]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
        {currentStatus}
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-40 bg-white border border-stone-200 rounded-xl shadow-xl z-[70] p-1.5 overflow-hidden"
            >
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdate(s);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    s === currentStatus 
                      ? 'bg-stone-900 text-white' 
                      : 'hover:bg-stone-50 text-stone-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
