import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Puzzle, Network, LayoutGrid, Sparkles, Clock, BookOpen, UserCheck, Globe, Dna, ClipboardCheck, Users, Microscope, FileText, Pill, HeartHandshake, TrendingUp, Rocket, Star, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import MindMapContainer from '../../components/mindmap/MindMapContainer.jsx';

// Default 16 comprehensive clinical lesson orbits for Autism Spectrum Disorder (ASD) matching Reference Image 3 exactly
const DEFAULT_ASD_LESSONS = [
  { _id: 'less-1', title: 'History of ASD', slug: 'history-of-asd', badge: 1, icon: 'Clock', color: '#8B5CF6' },
  { _id: 'less-5', title: 'Etiology', slug: 'etiology-of-asd', badge: 5, icon: 'Dna', color: '#10B981' },
  { _id: 'less-6', title: 'Assessment & Diagnosis', slug: 'assessment-diagnosis-asd', badge: 6, icon: 'ClipboardCheck', color: '#06B6D4' },
  { _id: 'less-7', title: 'Differential Diagnosis', slug: 'differential-diagnosis-asd', badge: 7, icon: 'Users', color: '#F97316' },
  { _id: 'less-8', title: 'Investigations', slug: 'investigations-asd', badge: 8, icon: 'Microscope', color: '#22C55E' },
  { _id: 'less-9', title: 'Management Protocols', slug: 'management-asd', badge: 9, icon: 'FileText', color: '#3B82F6' },
  { _id: 'less-10', title: 'Pharmacological Management', slug: 'pharmacological-management-asd', badge: 10, icon: 'Pill', color: '#EA580C' },
  { _id: 'less-11', title: 'Therapeutic Interventions', slug: 'therapeutic-interventions-asd', badge: 11, icon: 'HeartHandshake', color: '#16A34A' },
  { _id: 'less-12', title: 'Prognosis & Outcome', slug: 'prognosis-outcome-asd', badge: 12, icon: 'TrendingUp', color: '#F43F5E' },
  { _id: 'less-13', title: 'Family Support & Counseling', slug: 'family-support-counseling-asd', badge: 13, icon: 'Users', color: '#8B5CF6' },
  { _id: 'less-14', title: 'Comorbidity & Epilepsy', slug: 'comorbidity-epilepsy-asd', badge: 14, icon: 'Activity', color: '#E11D48' },
  { _id: 'less-15', title: 'Educational Rehabilitation', slug: 'educational-rehabilitation-asd', badge: 15, icon: 'BookOpen', color: '#2563EB' },
  { _id: 'less-16', title: 'Recent Advances & Future', slug: 'recent-advances-asd', badge: 16, icon: 'Rocket', color: '#0D9488' },
  { _id: 'less-2', title: 'Nosology & Classification', slug: 'nosology-classification-asd', badge: 2, icon: 'BookOpen', color: '#22C55E' },
  { _id: 'less-3', title: 'Clinical Features', slug: 'clinical-features-asd', badge: 3, icon: 'UserCheck', color: '#F59E0B' },
  { _id: 'less-4', title: 'Epidemiology', slug: 'epidemiology-asd', badge: 4, icon: 'Globe', color: '#EC4899' },
];

const TopicMindMap = () => {
  const { slug = 'autism-spectrum-disorder' } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('RADIAL'); // Match Screen 3 starburst layout by default

  // Attempt fetching from API
  const { data: topicData, isLoading } = useQuery({
    queryKey: ['topicMindMap', slug],
    queryFn: () => api.get(`/topics/slug/${slug}/map`),
    staleTime: 5 * 60 * 1000,
  });

  // Determine root topic titles and formatting
  const topic = useMemo(() => {
    if (topicData?.rootTopic) return topicData.rootTopic;
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      title: slug === 'autism-spectrum-disorder' ? 'Autism Spectrum Disorder (ASD)' : title,
      shortCode: slug === 'autism-spectrum-disorder' ? 'ASD' : title.split(' ')[0],
      color: '#126BEE',
      description: 'Comprehensive Level 3 Clinical Lesson Modules and Diagnostic Protocols.'
    };
  }, [topicData, slug]);

  // Use backend lessons if available and plentiful, otherwise use complete 16-lesson starburst from Image 3
  const lessons = useMemo(() => {
    const apiChildren = topicData?.mapData ? topicData.mapData.filter(i => i._id !== topic._id) : [];
    if (apiChildren.length > 8) {
      return apiChildren.map((c, idx) => {
        const fallback = DEFAULT_ASD_LESSONS[idx % DEFAULT_ASD_LESSONS.length];
        return {
          _id: c._id || c.id || fallback._id,
          title: c.title || fallback.title,
          slug: c.slug || fallback.slug,
          badge: idx + 1,
          icon: c.icon || fallback.icon,
          color: c.color || fallback.color,
        };
      });
    }
    return DEFAULT_ASD_LESSONS;
  }, [topicData, topic._id]);

  // Construct 360-degree starburst React Flow nodes around central Topic hub (Image 3)
  const { nodes, edges } = useMemo(() => {
    const centerNode = {
      id: `center-${slug}`,
      type: 'center',
      position: { x: 800 - 128, y: 800 - 128 }, // Center of canvas at (800, 800)
      data: {
        label: slug === 'autism-spectrum-disorder' ? 'ASD' : (topic.shortCode || topic.title || 'Topic').toUpperCase(),
        subLabel: topic.title.toUpperCase(),
        slogan: 'Select any lesson module below.',
        icon: 'Puzzle',
        color: '#126BEE',
      },
    };

    const count = lessons.length;
    const radius = 380; // Radial separation for 16 nodes
    const orbitNodes = [];
    const orbitEdges = [];

    // Sort lessons by badge number for sequential display around the circle
    const sortedLessons = [...lessons].sort((a, b) => (a.badge || 0) - (b.badge || 0));

    sortedLessons.forEach((item, idx) => {
      // Start at top (-PI/2) and circle clockwise
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const x = 800 + radius * Math.cos(angle) - 80;
      const y = 800 + radius * Math.sin(angle) - 80;

      const nodeId = `node-${item._id || idx}`;

      orbitNodes.push({
        id: nodeId,
        type: 'orbit',
        position: { x, y },
        data: {
          id: item._id,
          label: item.title,
          slug: item.slug,
          badgeNumber: item.badge || (idx + 1), // Renders the top colored numbered circular badge!
          icon: item.icon,
          color: item.color,
          onNodeClick: (nodeData) => {
            // CLICKING ANY OF THE 16 LESSON CIRCLES IMMEDIATELY OPEN SCREEN 4 (Video + Notes + MCQs)
            const targetLessonSlug = nodeData.slug || 'history-of-asd';
            navigate(`/lesson/${targetLessonSlug}`);
          },
        },
      });

      orbitEdges.push({
        id: `edge-root-${item._id || idx}`,
        source: `center-${slug}`,
        target: nodeId,
        type: 'default',
        style: { stroke: `${item.color || '#126BEE'}75`, strokeWidth: 2.5 },
        animated: item.title.includes('History') || item.badge === 1, // Pulse starting module
      });
    });

    return { nodes: [centerNode, ...orbitNodes], edges: orbitEdges };
  }, [lessons, topic, slug, navigate]);

  if (isLoading && !topicData) {
    return (
      <div className="p-16 text-center font-extrabold text-navy flex flex-col items-center gap-4">
        <Puzzle className="w-12 h-12 text-primaryBlue animate-bounce" />
        <span className="text-lg">Generating 16-Node Topic Starburst Chart...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { title: 'Home', link: '/' },
            { title: 'Child Psychiatry', link: '/learn/psychiatry/child-psychiatry' },
            { title: topic.title },
          ]}
        />
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-borderLine text-xs font-extrabold text-navy hover:text-primaryBlue shadow-sm hover:shadow transition-all">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Add to Favorites</span>
          </button>
          <Link
            to="/learn/psychiatry/child-psychiatry"
            className="flex items-center gap-1.5 text-xs font-extrabold text-navy hover:text-primaryBlue bg-white px-4 py-2 rounded-2xl border border-borderLine shadow-sm hover:shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Branches</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-borderLine rounded-3xl p-6 lg:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#E9F2FF] text-primaryBlue text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Puzzle className="w-3.5 h-3.5" /> Topic Starburst: Level 3 Modules
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-navy tracking-tight mt-2">
            {topic.title}
          </h1>
          <p className="text-sm md:text-base font-medium text-muted mt-1 max-w-3xl">
            Here are the 16 comprehensive lesson orbits for this disorder. Click on ANY numbered lesson circle (such as <strong>1. History of ASD</strong> or <strong>5. Etiology</strong>) to enter the integrated Video lecture, MCQ evaluation, and clinical notes section.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-secondaryBg p-1.5 rounded-2xl border border-borderLine self-stretch md:self-auto justify-center">
          <button
            onClick={() => setViewMode('RADIAL')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'RADIAL' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Starburst Map (16 Modules)</span>
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'GRID' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grid Modules</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas or Grid Display */}
      {viewMode === 'RADIAL' ? (
        <div className="relative">
          <MindMapContainer
            initialNodes={nodes}
            initialEdges={edges}
            className="h-[820px] lg:h-[880px]"
            onNodeClick={(data) => navigate(`/lesson/${data.slug || 'history-of-asd'}`)}
          />
        </div>
      ) : (
        /* Grid Display of Lesson Modules */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lessons.map((item, idx) => {
            const IconComp = Icons[item.icon || 'BookOpen'] || Icons.BookOpen;
            return (
              <div
                key={item._id}
                onClick={() => navigate(`/lesson/${item.slug || 'history-of-asd'}`)}
                style={{ borderTopColor: item.color }}
                className="bg-white border border-borderLine border-t-[6px] rounded-3xl p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-current/20 group-hover:scale-110 transition-transform"
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span
                      style={{ backgroundColor: item.color }}
                      className="w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shadow-md"
                    >
                      {item.badge || idx + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-navy uppercase tracking-tight group-hover:text-primaryBlue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-muted mt-2">
                    Includes high-definition video lesson, visual synthesis study note, and case-based practice MCQs.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-borderLine flex items-center justify-between text-xs font-extrabold text-navy group-hover:text-primaryBlue">
                  <span>Launch Module</span>
                  <Icons.ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicMindMap;
