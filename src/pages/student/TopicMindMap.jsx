import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Puzzle, Network, LayoutGrid, Sparkles, Clock, BookOpen, UserCheck, Globe, Dna, ClipboardCheck, Users, Microscope, FileText, Pill, HeartHandshake, TrendingUp, Rocket, Star, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import MindMapContainer from '../../components/mindmap/MindMapContainer.jsx';

// Lesson modules and clinical study orbits are loaded dynamically from the database

const TopicMindMap = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('RADIAL');

  // Attempt fetching from API
  const { data: topicData, isLoading } = useQuery({
    queryKey: ['topicMindMap', slug],
    queryFn: () => api.get(`/topics/slug/${slug}/map`),
    staleTime: 5 * 1000,
    enabled: !!slug,
  });

  // Determine root topic titles and formatting dynamically from backend database
  const topic = useMemo(() => {
    if (topicData?.rootTopic) {
      const rt = topicData.rootTopic;
      return {
        _id: rt._id || rt.id,
        title: rt.title || 'Topic Module',
        shortCode: rt.title ? rt.title.split(' ')[0] : 'TOPIC',
        color: rt.color || '#126BEE',
        description: rt.description || 'Comprehensive Level 3 Clinical Lesson Modules and Diagnostic Protocols.',
        categoryName: rt.category?.name || rt.category?.title || 'Related Category',
        categorySlug: rt.category?.slug || '',
      };
    }
    const fallbackTitle = (slug || 'Topic').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      _id: 'loading-topic',
      title: fallbackTitle,
      shortCode: fallbackTitle.split(' ')[0],
      color: '#126BEE',
      description: 'Comprehensive Clinical Lesson Modules and Diagnostic Protocols.',
      categoryName: 'Related Category',
      categorySlug: '',
    };
  }, [topicData, slug]);

  // Derive lesson study modules directly from live database child records or provide an interactive access module for leaf subtopics
  const lessons = useMemo(() => {
    const apiChildren = topicData?.mapData ? topicData.mapData.filter(i => (i._id !== topic._id && i.id !== topic._id)) : [];
    const palette = ['#8B5CF6', '#10B981', '#06B6D4', '#F97316', '#22C55E', '#3B82F6', '#EA580C', '#E11D48', '#0D9488'];

    if (apiChildren.length === 0) {
      return [];
    }

    return apiChildren.map((c, idx) => ({
      _id: c._id || c.id || `lesson-${idx}`,
      title: c.title || `Module ${idx + 1}`,
      slug: c.slug || `module-${idx + 1}`,
      badge: c.displayOrder || idx + 1,
      icon: c.icon || 'BookOpen',
      color: c.color || palette[idx % palette.length],
    }));
  }, [topicData, topic._id, topic.title, slug]);

  // Construct 360-degree starburst React Flow nodes around central Topic hub (Image 3)
  const { nodes, edges } = useMemo(() => {
    const centerNode = {
      id: `center-${slug}`,
      type: 'center',
      position: { x: 800 - 128, y: 800 - 128 },
      data: {
        label: (topic.shortCode || topic.title || 'Topic').slice(0, 6).toUpperCase(),
        subLabel: (topic.title || 'Topic').toUpperCase(),
        slogan: lessons.length === 0 ? 'No sub subtopics' : 'Select any lesson module below.',
        icon: 'Puzzle',
        color: topic.color || '#126BEE',
      },
    };

    const count = lessons.length;
    const radius = 350;
    const orbitNodes = [];
    const orbitEdges = [];

    const sortedLessons = [...lessons].sort((a, b) => (a.badge || 0) - (b.badge || 0));

    sortedLessons.forEach((item, idx) => {
      const angle = count > 0 ? (idx / count) * 2 * Math.PI - Math.PI / 2 : 0;
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
          badgeNumber: item.badge || (idx + 1),
          icon: item.icon,
          color: item.color,
          onNodeClick: (nodeData) => {
            if (nodeData.slug) {
              navigate(`/lesson/${nodeData.slug}`);
            }
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
    return <NeonBrainLoader text="Loading Topic Starburst Chart..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { title: 'Home', link: '/' },
            { title: topic.categoryName || 'Category', link: topic.categorySlug ? `/learn/psychiatry/${topic.categorySlug}` : '/' },
            { title: topic.title },
          ]}
        />
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-borderLine text-xs font-semibold text-navy hover:text-primaryBlue shadow-sm hover:shadow transition-all">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Add to Favorites</span>
          </button>
          <Link
            to={topic.categorySlug ? `/learn/psychiatry/${topic.categorySlug}` : '/'}
            className="flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-primaryBlue bg-white px-4 py-2 rounded-lg border border-borderLine shadow-sm hover:shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Branches</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-borderLine rounded-xl p-6 lg:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#E9F2FF] text-primaryBlue text-[11px] font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Puzzle className="w-3.5 h-3.5" /> Topic Starburst: Level 3 Modules
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-navy tracking-tight mt-2">
            {topic.title}
          </h1>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-secondaryBg p-1.5 rounded-lg border border-borderLine self-stretch md:self-auto justify-center">
          <button
            onClick={() => setViewMode('RADIAL')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'RADIAL' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Starburst Map View</span>
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
            onNodeClick={(data) => {
              if (data.slug) navigate(`/lesson/${data.slug}`);
            }}
          />
        </div>
      ) : (
        /* Grid Display of Lesson Modules */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lessons.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted text-sm font-semibold">
              No sub subtopics
            </div>
          ) : (
            lessons.map((item, idx) => {
              const IconComp = Icons[item.icon || 'BookOpen'] || Icons.BookOpen;
            return (
              <div
                key={item._id}
                onClick={() => navigate(`/lesson/${item.slug || ''}`)}
                style={{ borderTopColor: item.color }}
                className="bg-white border border-borderLine border-t-[6px] rounded-xl p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      className="w-12 h-12 rounded-lg flex items-center justify-center border border-current/20 group-hover:scale-110 transition-transform"
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span
                      style={{ backgroundColor: item.color }}
                      className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-md"
                    >
                      {item.badge || idx + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy uppercase tracking-tight group-hover:text-primaryBlue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-muted mt-2">
                    Includes high-definition video lesson, visual synthesis study note, and case-based practice MCQs.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-borderLine flex items-center justify-between text-xs font-semibold text-navy group-hover:text-primaryBlue">
                  <span>Launch Module</span>
                  <Icons.ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};

export default TopicMindMap;
