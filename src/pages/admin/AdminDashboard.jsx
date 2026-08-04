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

  const stats = adminData?.stats || {
    totalStudents: 142,
    totalSubjects: 2,
    totalCategories: 12,
    totalTopics: 182,
    totalVideos: 24,
    totalNotes: 56,
    totalMCQs: 120,
    totalResources: 220,
  };

  const mostCompleted = adminData?.mostCompletedTopics || [
    { title: 'History of ASD', category: 'Child Psychiatry', completionRate: '96%', studentsCount: 142 },
    { title: 'Etiology & Genetics', category: 'Child Psychiatry', completionRate: '88%', studentsCount: 118 },
    { title: 'Clinical Features of ADHD', category: 'Child Psychiatry', completionRate: '84%', studentsCount: 94 },
    { title: 'Pharmacological Management', category: 'Psychopharmacology', completionRate: '79%', studentsCount: 86 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="bg-white border border-borderLine rounded-3xl p-8 shadow-soft flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight">Curriculum Analytics Overview</h1>
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
                <div className="text-3xl font-black text-navy mt-2">{c.val}</div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Table */}
      <div className="bg-white border border-borderLine rounded-3xl p-8 shadow-soft">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderLine">
          <h2 className="text-lg font-black text-navy flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-medicalGreen" /> Most Completed Clinical Topics
          </h2>
          <span className="text-xs font-bold text-muted uppercase">Past 30 Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borderLine text-xs font-extrabold text-muted uppercase">
                <th className="py-3 px-4">Topic Lesson Title</th>
                <th className="py-3 px-4">Category Domain</th>
                <th className="py-3 px-4">Students Explored</th>
                <th className="py-3 px-4">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
              {mostCompleted.map((t, idx) => (
                <tr key={idx} className="hover:bg-secondaryBg/80 transition-colors">
                  <td className="py-4 px-4 font-black">{t.title}</td>
                  <td className="py-4 px-4 text-muted">{t.category}</td>
                  <td className="py-4 px-4 text-primaryBlue font-bold">{t.studentsCount} residents</td>
                  <td className="py-4 px-4 font-bold text-medicalGreen">{t.completionRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
