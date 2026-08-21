import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Flame, Award, Clock, ArrowRight, Brain, FileText, Bookmark as BookmarkIcon, CheckCircle2, PlayCircle, Layers, Globe, Map } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch student progress metrics and study activity log
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/progress/me'),
    staleTime: 30 * 1000,
  });

  const stats = statsData?.stats || {
    progressPercentage: 0,
    topicsExplored: 0,
    totalTopics: 0,
    notesCreated: 0,
    flashcardsAvailable: 0,
    quizzesTaken: 0,
    studyStreak: user?.studyStreak || 0,
  };

  const rawActivityList = statsData?.recentActivity || [];
  // Filter out any duplicates that might have been saved in the DB previously
  const activityList = [];
  const seenActivity = new Set();
  for (const item of rawActivityList) {
    const key = `${item.title}-${item.link}`;
    if (!seenActivity.has(key)) {
      seenActivity.add(key);
      activityList.push(item);
    }
  }

  if (isLoading) {
    return <NeonBrainLoader text="Loading Dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto">
      <Breadcrumb items={[{ title: 'Home', link: '/' }, { title: 'Resident Learning Dashboard' }]} />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-[#123899] rounded-xl p-8 md:p-10 text-white shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-white/20 text-white text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            {user?.specialization || 'Child & Adolescent Psychiatry Resident'}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mt-3">
            Welcome Back, {user?.fullName || 'Resident Dr. Sarah Jenkins'}!
          </h1>
          <p className="text-sm font-medium text-white/80 mt-2 max-w-2xl leading-relaxed">
            You are on a remarkable clinical learning trajectory. Your mastery of <strong>Neurodevelopmental Disorders</strong> has expanded significantly this week.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-lg border border-white/20 shrink-0 relative z-10">
          <Flame className="w-10 h-10 text-[#FFB020] animate-bounce" />
          <div>
            <div className="text-2xl font-bold text-white">{stats.studyStreak || 0} Days</div>
            <div className="text-xs font-bold text-white/70 uppercase">Active Study Streak</div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase">Curriculum Progress</div>
            <div className="text-3xl font-bold text-primaryBlue mt-1">{stats.progressPercentage}%</div>
            <div className="text-xs font-semibold text-navy mt-1">{stats.topicsExplored} of {stats.totalTopics} Topics Explored</div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E9F2FF] text-primaryBlue flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="medical-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase">Personal Study Vault</div>
            <div className="text-3xl font-bold text-navy mt-1">{stats.notesCreated}</div>
            <div className="text-xs font-semibold text-muted mt-1">Synchronized Note Syntheses</div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-secondaryBg text-navy flex items-center justify-center border border-borderLine">
            <FileText className="w-6 h-6 text-primaryBlue" />
          </div>
        </div>

        <div className="medical-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase">Flashcard Memory Decks</div>
            <div className="text-3xl font-bold text-medicalPurple mt-1">{stats.flashcardsAvailable}</div>
            <div className="text-xs font-semibold text-muted mt-1">High-Yield Board Flashcards</div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#F5EEFE] text-medicalPurple flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="medical-card flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase">Quizzes Completed</div>
            <div className="text-3xl font-bold text-medicalGreen mt-1">{stats.quizzesTaken}</div>
            <div className="text-xs font-semibold text-muted mt-1">Vignettes Evaluated</div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#EAF7ED] text-medicalGreen flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-borderLine rounded-xl p-7 shadow-soft">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderLine">
            <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-primaryBlue" /> Recent Learning Chronology
            </h2>
            <Link to="/recent" className="text-xs font-bold text-primaryBlue hover:underline">View Entire History</Link>
          </div>

          <div className="space-y-4">
            {activityList.map((item, idx) => (
              <Link
                key={idx}
                to={item.link || '/'}
                className="flex items-center justify-between p-4 rounded-lg bg-secondaryBg border border-borderLine hover:bg-white hover:border-primaryBlue/30 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl border border-borderLine shadow-inner">
                    {item.type === 'Video' ? <PlayCircle className="w-5 h-5 text-medicalPurple" /> : <Brain className="w-5 h-5 text-primaryBlue" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-navy group-hover:text-primaryBlue transition-colors">{item.title}</div>
                    <div className="text-xs font-medium text-muted">{item.subtitle}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primaryBlue group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="bg-white border border-borderLine rounded-xl p-7 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-navy mb-4 pb-3 border-b border-borderLine flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan" /> Curriculum Shortcuts
            </h3>
            <div className="space-y-3">
              {statsData?.recommendedShortcuts?.orbit && (
                <Link to={statsData.recommendedShortcuts.orbit.link} className="flex items-center gap-3 p-4 rounded-lg bg-[#EAF7FD] border border-cyan/20 font-bold text-sm text-cyan hover:bg-cyan hover:text-white transition-all shadow-xs group">
                  <Globe className="w-5 h-5 shrink-0 group-hover:text-white" /> 
                  <span>Open {statsData.recommendedShortcuts.orbit.title} Orbit</span>
                </Link>
              )}
              {statsData?.recommendedShortcuts?.map && (
                <Link to={statsData.recommendedShortcuts.map.link} className="flex items-center gap-3 p-4 rounded-lg bg-[#E9F2FF] border border-primaryBlue/20 font-bold text-sm text-primaryBlue hover:bg-primaryBlue hover:text-white transition-all shadow-xs group">
                  <Map className="w-5 h-5 shrink-0 group-hover:text-white" /> 
                  <span>{statsData.recommendedShortcuts.map.title} Map</span>
                </Link>
              )}
              {statsData?.recommendedShortcuts?.video && (
                <Link to={statsData.recommendedShortcuts.video.link} className="flex items-center gap-3 p-4 rounded-lg bg-[#F5EEFE] border border-medicalPurple/20 font-bold text-sm text-medicalPurple hover:bg-medicalPurple hover:text-white transition-all shadow-xs group">
                  <PlayCircle className="w-5 h-5 shrink-0 group-hover:text-white" /> 
                  <span>Watch {statsData.recommendedShortcuts.video.title} Video & Notes</span>
                </Link>
              )}
              <Link to="/my-notes" className="flex items-center gap-3 p-4 rounded-lg bg-secondaryBg border border-borderLine font-bold text-sm text-navy hover:bg-white transition-all shadow-xs group">
                <FileText className="w-5 h-5 shrink-0 text-primaryBlue" /> 
                <span>My Resident Study Vault ({stats.notesCreated} Notes)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
