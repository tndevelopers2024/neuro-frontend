import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Brain, Activity, Compass, Play, FileText, HelpCircle, TrendingUp, Layers } from 'lucide-react';
import api from '../../api/axiosInstance.js';

const AdminDashboard = () => {
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => api.get('/admin/stats'),
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Activity className="w-10 h-10 text-primaryBlue animate-spin" />
        <span>Loading Analytics Dashboard...</span>
      </div>
    );
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

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="bg-white border border-borderLine rounded-xl p-8 shadow-soft flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight">Curriculum Analytics Overview</h1>
          <p className="text-sm font-medium text-muted mt-1">Real-time engagement metrics across all medical resident cohorts and interactive study orbits.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Resident Students', val: stats.totalStudents, icon: Users, color: 'text-primaryBlue bg-[#E9F2FF]' },
          { label: 'Published Category Orbits', val: stats.totalCategories, icon: Activity, color: 'text-cyan bg-[#EAF7FD]' },
          { label: 'Interactive Mind Map Topics', val: stats.totalTopics, icon: Compass, color: 'text-medicalGreen bg-[#EAF7ED]' },
          { label: 'Total Learning Materials', val: stats.totalResources, icon: FileText, color: 'text-medicalPurple bg-[#F5EEFE]' },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="medical-card flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-muted uppercase">{c.label}</div>
                <div className="text-3xl font-bold text-navy mt-2">{c.val}</div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Table */}
      <div className="bg-white border border-borderLine rounded-xl p-8 shadow-soft">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderLine">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-medicalGreen" /> Most Completed Clinical Topics
          </h2>
          <span className="text-xs font-bold text-muted uppercase">Past 30 Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borderLine text-xs font-semibold text-muted uppercase">
                <th className="py-3 px-4">Topic Lesson Title</th>
                <th className="py-3 px-4">Category Domain</th>
                <th className="py-3 px-4">Students Explored</th>
                <th className="py-3 px-4">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
              {mostCompleted.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center text-muted font-medium">
                    No completion data available yet.
                  </td>
                </tr>
              ) : (
                mostCompleted.map((t, idx) => (
                  <tr key={idx} className="hover:bg-secondaryBg/80 transition-colors">
                    <td className="py-4 px-4 font-bold">{t.title}</td>
                    <td className="py-4 px-4 text-muted">{t.category}</td>
                    <td className="py-4 px-4 text-primaryBlue font-bold">{t.studentsCount} residents</td>
                    <td className="py-4 px-4 font-bold text-medicalGreen">{t.completionRate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
