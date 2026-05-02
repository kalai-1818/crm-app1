import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Users, 
  Target, 
  MessageSquare, 
  Activity, 
  LogOut, 
  TrendingUp, 
  CheckSquare, 
  Clock,
  ArrowUpRight,
  X
} from "lucide-react";
import { authService } from "../services/authService.ts";
import { dashboardService } from "../services/dashboardService.ts";
import { analyticsService } from "../services/analyticsService.ts";
import { Skeleton, CardSkeleton, TableRowSkeleton } from "../components/ui/Skeleton.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalLeads: 0, totalTasks: 0 });
  const [analytics, setAnalytics] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [dashData, analyticsData] = await Promise.all([
        dashboardService.getStats(),
        analyticsService.getAnalytics()
      ]);
      setStats(dashData.stats);
      setActivity(dashData.activity);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message || "Failed to load performance data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const leadChartData = analytics?.leadsTimeline || [];
  const taskChartData = analytics?.tasksTimeline || [];
  
  // Combine for comparison chart
  const combinedTimeline = leadChartData.map((l: any, i: number) => ({
    name: l.name,
    leads: l.count,
    tasks: taskChartData[i]?.count || 0
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Workspace <span className="text-orange-600">Intelligence.</span></h1>
          <p className="text-stone-500 text-sm mt-1 font-medium tracking-tight">Real-time performance metrics and nexus activity logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Last Synced</p>
            <p className="text-xs font-bold text-stone-900">Just now</p>
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-orange-600" /> Refresh Data
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
          <button onClick={fetchData} className="underline uppercase tracking-widest hover:text-red-700">Force Sync</button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </>
          ) : (
            <>
              <AnalyticCard 
                label="Total Leads" 
                value={analytics?.summary?.totalLeads || 0} 
                icon={<Target className="text-orange-600 w-4 h-4" />} 
                data={leadChartData}
                color="#f97316"
              />
              <AnalyticCard 
                label="Tasks Completed" 
                value={analytics?.summary?.tasksCompleted || 0} 
                icon={<CheckSquare className="text-blue-600 w-4 h-4" />} 
                data={taskChartData}
                color="#3b82f6"
              />
              <AnalyticCard 
                label="Conversion rate" 
                value={`${(analytics?.summary?.conversionRate || 0).toFixed(1)}%`} 
                icon={<TrendingUp className="text-green-600 w-4 h-4" />} 
                data={leadChartData.map((l: any) => ({ ...l, count: l.count * 1.5 }))} // Mock visual for trend
                color="#22c55e"
              />
              <AnalyticCard 
                label="Velocity Index" 
                value={`${(analytics?.summary?.taskCompletionRate || 0).toFixed(1)}%`} 
                icon={<Activity className="text-purple-600 w-4 h-4" />} 
                data={taskChartData.map((t: any) => ({ ...t, count: t.count * 2 }))} // Mock visual for trend
                color="#a855f7"
              />
            </>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm shadow-stone-900/5 flex flex-col min-h-[400px]">
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/20">
              <h2 className="text-sm font-bold flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Performance Matrix (Last 7 Days)
              </h2>
              {!isLoading && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Leads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tasks</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 h-[300px] w-full flex-1">
               {isLoading ? (
                 <div className="h-full flex flex-col gap-4">
                   <Skeleton className="h-4 w-full" />
                   <div className="flex-1 flex items-end gap-2">
                     <Skeleton className="h-1/2 flex-1" />
                     <Skeleton className="h-3/4 flex-1" />
                     <Skeleton className="h-2/3 flex-1" />
                     <Skeleton className="h-1/3 flex-1" />
                     <Skeleton className="h-1/2 flex-1" />
                     <Skeleton className="h-full flex-1" />
                     <Skeleton className="h-4/5 flex-1" />
                   </div>
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height={300}>
                   <AreaChart data={combinedTimeline}>
                   <defs>
                     <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 700, fill: '#a8a29e' }} 
                     dy={10}
                   />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ 
                       borderRadius: '12px', 
                       border: '1px solid #e7e5e4', 
                       boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                       fontSize: '10px',
                       fontWeight: '700',
                       textTransform: 'uppercase',
                       letterSpacing: '0.05em'
                     }} 
                   />
                   <Area 
                     type="monotone" 
                     dataKey="leads" 
                     stroke="#f97316" 
                     fillOpacity={1} 
                     fill="url(#colorLeads)" 
                     strokeWidth={3}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="tasks" 
                     stroke="#3b82f6" 
                     fillOpacity={1} 
                     fill="url(#colorTasks)" 
                     strokeWidth={3} 
                   />
                 </AreaChart>
               </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-xl shadow-stone-900/10 relative overflow-hidden group border border-stone-800">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Global Conversion</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-black text-3xl tracking-tight mb-2">{(analytics?.summary?.conversionRate || 0).toFixed(1)}% <span className="text-stone-500 text-xl font-bold">avg</span></h3>
              <p className="text-stone-400 text-xs mb-8 leading-relaxed font-medium">Tracking {analytics?.summary?.convertedLeads || 0} successful nexus conversions across all active leads.</p>
              
              <div className="h-20 w-full mb-6">
                <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={leadChartData}>
                      <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center text-[8px] font-black">U{i}</div>
                    ))}
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 tracking-tighter">Elite Team Performance</span>
              </div>
            </div>
            <Activity className="absolute -bottom-6 -right-6 w-32 h-32 text-stone-800 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm shadow-stone-900/5">
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/20">
              <h2 className="text-sm font-bold flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-orange-600" />
                Nexus Stream
              </h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-orange-600 transition-colors">History</button>
            </div>
            <div className="divide-y divide-stone-50">
              {isLoading ? (
                <div className="divide-y divide-stone-50">
                  <TableRowSkeleton columns={2} />
                  <TableRowSkeleton columns={2} />
                  <TableRowSkeleton columns={2} />
                  <TableRowSkeleton columns={2} />
                </div>
              ) : activity.length > 0 ? (
                activity.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.id} 
                    className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/80 transition-colors group cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        item.type === 'lead' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.type === 'lead' ? <Target className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{item.title}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-stone-200 group-hover:text-orange-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </motion.div>
                ))
              ) : (
                <EmptyState 
                  title="Silence in the Nexus." 
                  description="No activity recorded in the global context today."
                  icon={<MessageSquare className="w-8 h-8" />}
                />
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm shadow-stone-900/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-stone-400">System Vitals</h3>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <HealthIndicator label="Nexus API" status="Online" color="bg-green-500" />
              <HealthIndicator label="DB Performance" status="Active" color="bg-green-500" />
              <HealthIndicator label="Compute Engine" status="Optimized" color="bg-orange-500" />
            </div>
            <button className="w-full mt-6 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-stone-100">
              Diagnostics Report
            </button>
          </div>
        </div>
      </div>
    );
}

function AnalyticCard({ label, value, icon, data, color }: { label: string, value: string | number, icon: React.ReactNode, data: any[], color: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md hover:border-stone-300 transition-all cursor-default group shadow-sm shadow-stone-950/5">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke={color} 
                fill={color} 
                fillOpacity={0.1} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black tracking-tight text-stone-900">{value}</p>
      </div>
    </div>
  );
}

function HealthIndicator({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-stone-50 rounded-lg transition-colors">
      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black text-stone-900 tracking-tight">{status}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      </div>
    </div>
  );
}
