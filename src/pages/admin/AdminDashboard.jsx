import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Layers, FileText, MoreHorizontal, Activity, TrendingUp, Video, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import api from '../../api/axiosInstance.js';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';
const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e'];

const AdminDashboard = () => {
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => api.get('/admin/stats'),
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return <NeonBrainLoader text="Aggregating Analytics..." />;
  }

  const stats = adminData?.stats || {
    totalStudents: 0,
    totalSubjects: 0,
    totalCategories: 0,
    totalTopics: 0,
    totalVideos: 0,
    totalNotes: 0,
    totalMCQs: 0,
    totalResources: 0,
  };

  const mostCompleted = adminData?.mostCompletedTopics || [];
  
  const hasContent = stats.totalVideos > 0 || stats.totalNotes > 0 || stats.totalMCQs > 0;

  // Data for Donut Chart
  const chartData = hasContent ? [
    { name: 'Videos', value: stats.totalVideos || 0, color: '#8b5cf6' },
    { name: 'Notes & PDFs', value: stats.totalNotes || 0, color: '#06b6d4' },
    { name: 'MCQs', value: stats.totalMCQs || 0, color: '#10b981' },
  ] : [
    { name: 'No Content', value: 1, color: '#f3f4f6' }
  ];

  const legendData = [
    { name: 'Videos', color: '#8b5cf6' },
    { name: 'Notes & PDFs', color: '#06b6d4' },
    { name: 'MCQs', color: '#10b981' },
  ];

  // Data for the solid purple card showing platform interactions trend
  const interactionTrend = adminData?.interactionTrend || [
    { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 },
    { name: 'Sun', value: 0 },
  ];

  return (
    <div className="space-y-6 pb-16 min-h-screen">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Students', val: stats.totalStudents, icon: Users, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          { label: 'Published Modules', val: stats.totalCategories, icon: BookOpen, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Clinical Topics', val: stats.totalTopics, icon: Layers, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
          { label: 'Total Materials', val: stats.totalResources, icon: FileText, iconBg: 'bg-rose-100', iconColor: 'text-rose-500' },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative">
              <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconColor}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-800 tracking-tight">{c.val}</div>
                  <div className="text-sm font-semibold text-gray-400 mt-0.5">{c.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800">Engagement Trend by Topic</h2>
            <select className="text-sm font-semibold text-gray-500 bg-transparent outline-none cursor-pointer">
              <option>Show by month</option>
              <option>Show by week</option>
            </select>
          </div>
          <div className="h-[280px] w-full relative">
            {mostCompleted.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm font-semibold">Gathering engagement data...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostCompleted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} />
                  <RechartsTooltip wrapperStyle={{ zIndex: 100 }} cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="studentsCount" fill="#8b5cf6" radius={[6, 6, 6, 6]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Content Composition</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {hasContent && <RechartsTooltip wrapperStyle={{ zIndex: 100 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />}
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-gray-800">{stats.totalResources}</span>
              <span className="text-xs font-semibold text-gray-400">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            {legendData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-semibold text-gray-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clinical Topics List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Topic Completion Status</h2>
            <select className="text-sm font-semibold text-gray-500 bg-transparent outline-none cursor-pointer">
              <option>Filter by Domain</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 px-2">Lesson Title</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2 text-right">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mostCompleted.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-400 text-sm font-semibold">
                      Waiting for student activity...
                    </td>
                  </tr>
                ) : (
                  mostCompleted.map((topic, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800 text-sm">{topic.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm font-semibold text-gray-500">{topic.category}</span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="text-sm font-extrabold text-gray-800">{topic.studentsCount}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decorative Solid Card */}
        <div className="bg-[#7c3aed] rounded-2xl p-6 shadow-md shadow-purple-500/20 relative overflow-hidden flex flex-col justify-between group">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white tracking-tight">{adminData?.totalInteractions || 0}</h2>
            <p className="text-purple-200 text-sm font-medium mt-1">Total Platform Interactions</p>
          </div>
          
          <div className="h-[120px] w-[120%] -ml-[10%] relative z-10 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interactionTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
