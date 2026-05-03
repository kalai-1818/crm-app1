import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  CheckSquare, 
  Columns2, 
  List, 
  Plus, 
  X, 
  Clock, 
  Loader2, 
  LogOut,
  MoreVertical,
  Trash2,
  Calendar,
  AlertCircle,
  Search
} from "lucide-react";
import { authService } from "../services/authService.ts";
import { taskService } from "../services/taskService.ts";
import { useToast } from "../components/ui/Toast.tsx";
import { Skeleton, CardSkeleton, TableRowSkeleton } from "../components/ui/Skeleton.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.tsx";

const PRIORITY_COLORS: any = {
  'High': 'text-red-600 bg-red-50 border-red-100',
  'Medium': 'text-orange-600 bg-orange-50 border-orange-100',
  'Low': 'text-blue-600 bg-blue-50 border-blue-100'
};

const STATUS_COLUMNS = ['Todo', 'In Progress', 'Done'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const search = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(search) || 
      (task.description && task.description.toLowerCase().includes(search))
    );
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const task = await taskService.createTask(newTask);
      setTasks([task, ...tasks]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'Todo' });
      toast('Task successfully synchronized', 'success');
    } catch (err) {
      toast('Task creation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = await taskService.updateTask(id, { status });
      setTasks(tasks.map(t => t._id === id ? updated : t));
      toast(`Status updated to ${status}`, 'success');
    } catch (err) {
      toast('Status update failed', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast('Task permanently erased', 'success');
    } catch (err) {
      toast('Erasure protocol failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Task <span className="text-orange-600">Velocity.</span></h1>
          <p className="text-stone-500 text-sm mt-1 font-medium tracking-tight">Managing {tasks.length} active work items in your project pipeline.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-stone-100 p-1 rounded-xl flex gap-1 border border-stone-200">
            <button 
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'kanban' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Columns2 className="w-3.5 h-3.5" /> Kanban
            </button>
            <button 
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
          >
            <Plus className="w-4 h-4" /> New Task
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
            <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
            {error}
          </div>
          <button onClick={fetchTasks} className="underline uppercase tracking-widest">Retry Sync</button>
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
            placeholder="Search nibble tasks..." 
            className="w-full bg-stone-50 border border-stone-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none h-10 border border-stone-200 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-colors">
            <AlertCircle className="w-3.5 h-3.5" /> High Priority
          </button>
          <button className="flex-1 md:flex-none h-10 border border-stone-200 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-colors">
             <Calendar className="w-3.5 h-3.5" /> This Week
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
           {[1,2,3].map(col => (
             <div key={col} className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
             </div>
           ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState 
           title="No active tasks in the nibble." 
           description="Your work pipeline is currently optimized. Create a new task to begin tracking execution."
           icon={<CheckSquare className="w-8 h-8" />}
           action={
             <button 
               onClick={() => setIsModalOpen(true)}
               className="px-8 py-3.5 bg-stone-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-stone-900/10"
             >
               <Plus className="w-4 h-4" /> Create First Task
             </button>
           }
        />
      ) : view === 'kanban' ? (
        <div className="grid md:grid-cols-3 gap-6 items-start pb-8">
          {STATUS_COLUMNS.map(status => (
            <KanbanColumn 
              key={status} 
              status={status} 
              tasks={filteredTasks.filter(t => t.status === status)} 
              onUpdateStatus={handleUpdateStatus}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm shadow-stone-900/5 mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="w-[45%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Description</th>
                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Status</th>
                  <th className="w-[15%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Priority</th>
                  <th className="w-[25%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredTasks.map(task => (
                  <tr key={task._id} className="group hover:bg-stone-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm tracking-tight truncate">{task.title}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight truncate mt-0.5">{task.description || "No metadata description"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                        className="bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:border-orange-500 transition-all"
                      >
                        {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteTask(deleteConfirmId)}
        title="Erase Task?"
        message="This will permanently delete the task from the system."
        confirmLabel="Erase"
      />

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-stone-200"
            >
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                <h2 className="text-xl font-black tracking-tight">Draft <span className="text-orange-600">Task.</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Assignment Header</label>
                  <input 
                    required 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    type="text" 
                    className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all font-sans"
                    placeholder="e.g. Design System refinement"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Context / Instruction</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all min-h-[100px] resize-none font-sans"
                    placeholder="Provide detailed context for this nibble execution..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Priority Vector</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all font-sans appearance-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 ml-1">Initial Phase</label>
                    <select 
                      value={newTask.status}
                      onChange={e => setNewTask({...newTask, status: e.target.value})}
                      className="w-full bg-white border border-stone-200 rounded-xl py-3.5 px-5 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all font-sans appearance-none"
                    >
                      {STATUS_COLUMNS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 shadow-xl shadow-stone-900/10"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Synchronize Task <Plus className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface KanbanColumnProps {
  key?: React.Key;
  status: string;
  tasks: any[];
  onUpdateStatus: (id: string, s: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

function KanbanColumn({ status, tasks, onUpdateStatus, onDelete }: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between px-2 py-3 border-b-2 border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          <h2 className="font-black text-[11px] uppercase tracking-[0.15em] text-stone-900">{status}</h2>
          <span className="bg-stone-100 text-stone-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-stone-200">{tasks.length}</span>
        </div>
        <button className="text-stone-300 hover:text-stone-950 transition-colors"><MoreVertical className="w-4 h-4" /></button>
      </div>
      
      <div className="flex flex-col gap-3 min-h-[500px]">
        {tasks.map((task, i) => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            key={task._id} 
            className="p-5 bg-white border border-stone-200 rounded-xl hover:shadow-xl hover:shadow-stone-900/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-stone-100 group-hover:bg-orange-500 transition-colors" />
            
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-colors ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
              <button 
                onClick={() => onDelete(task._id)} 
                className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <h3 className="font-bold text-sm mb-2 leading-tight text-stone-900 line-clamp-2">{task.title}</h3>
            {task.description && (
              <p className="text-[11px] text-stone-400 mb-6 line-clamp-3 leading-relaxed font-medium">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-stone-400 uppercase tracking-tight">
                <Clock className="w-3 h-3 translate-y-[-0.5px]" />
                {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-1 p-0.5 bg-stone-50 rounded-lg border border-stone-100">
                {STATUS_COLUMNS.map(s => (
                  <button 
                    key={s}
                    onClick={() => onUpdateStatus(task._id, s)}
                    className={`w-3 h-3 rounded transition-all hover:scale-110 ${s === status ? 'bg-orange-600 shadow-sm shadow-orange-900/20 w-5' : 'bg-stone-200 hover:bg-orange-400'}`}
                    title={`Move to ${s}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-stone-200 rounded-3xl flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-300 bg-stone-50/30">
            <CheckSquare className="w-8 h-8 mb-3 opacity-10" />
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Column Vacant</p>
          </div>
        )}
      </div>
    </div>
  );
}
