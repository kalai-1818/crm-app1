import React, { useState, useEffect } from "react";
import { projectService } from "../services/projectService.ts";
import { Briefcase, ChevronRight, CheckCircle2, Clock, BarChart3, Settings, AlertCircle, FileStack } from "lucide-react";
import { motion } from "motion/react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic uppercase text-stone-900">
            <Briefcase className="w-8 h-8 text-orange-600" /> Active <span className="text-orange-600">Projects</span>
          </h1>
          <p className="text-stone-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Operational Workspace & Fulfilment</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="h-48 bg-stone-100 rounded-3xl animate-pulse" />
          ))
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={project.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-stone-900/5 transition-all"
            >
              <div className="p-6 pb-4 border-b border-stone-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-stone-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                    {project.status}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight group-hover:text-orange-600 transition-colors leading-tight">{project.name}</h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Lead ID: {project.leadId.substring(0, 8)}</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" /> Progress Velocity
                    </span>
                    <span className="text-[10px] font-black text-stone-900">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      className="h-full bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-[9px] font-black uppercase text-stone-500">Tasks</span>
                    </div>
                    <p className="text-sm font-black text-stone-900">
                      {project.checklist?.filter((t: any) => t.isCompleted).length || 0}/{project.checklist?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-2 text-stone-400">
                      <FileStack className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase">Documents</span>
                    </div>
                    <p className="text-sm font-black text-stone-900">
                      {project.documents?.length || 0} Assets
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-stone-400">
                  <Clock className="w-3 h-3" /> Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-orange-600 animate-pulse">
                  <AlertCircle className="w-3 h-3" /> Milestones Pending
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="lg:col-span-2 py-32 text-center bg-white rounded-[40px] border border-dashed border-stone-200">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
               <Briefcase className="w-8 h-8 text-stone-200" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 mb-2">No Active Fulfilment</h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
              Convert leads to initialize high-velocity deployment cycles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
