import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Sparkles, LayoutGrid, Network, ChevronRight, BookOpen, Clock, Activity, Flame, Award, Bookmark as BookmarkIcon, FileText, Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import MindMapContainer from '../../components/mindmap/MindMapContainer.jsx';

// Categories and clinical subtopics are loaded dynamically from the database via API

const SubjectHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('GRID'); // 'MAP' or 'GRID'
  const [openCategory, setOpenCategory] = useState(null);

  // Fetch Psychiatry subject categories from API
  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subjectCategories', 'psychiatry'],
    queryFn: () => api.get('/subjects/psychiatry/categories'),
    staleTime: 5 * 1000,
  });

  // Dynamically derive topics and subtopics directly from live database records
  const rawCategories = subjectData?.categories || [];

  const categories = useMemo(() => {
    const palette = ['#126BEE', '#21A447', '#F17B18', '#7435D5', '#13A7B5', '#DB2674', '#10B981', '#EA580C'];
    return rawCategories.map((c, idx) => {
      return {
        ...c,
        _id: c._id || c.id || `cat-${idx}`,
        name: c.name || c.title || 'Unnamed Topic',
        slug: c.slug || `topic-${idx}`,
        icon: c.icon || 'Brain',
        color: c.color || c.themeColor || palette[idx % palette.length],
        subtopics: c.subtopics || [],
      };
    });
  }, [rawCategories]);

  // Filter categories and subtopics by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();

    return categories
      .map((cat) => {
        const catNameMatches = (cat.name || '').toLowerCase().includes(query) || (cat.description || '').toLowerCase().includes(query);
        const matchedSubtopics = (cat.subtopics || []).filter((sub) =>
          (sub.title || '').toLowerCase().includes(query) || (sub.description || '').toLowerCase().includes(query)
        );

        if (catNameMatches || matchedSubtopics.length > 0) {
          return {
            ...cat,
            // If the domain title itself matched, display all subtopics; otherwise focus purely on matching subtopics
            subtopics: catNameMatches ? cat.subtopics : matchedSubtopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, searchQuery]);

  // Transform into radial React Flow coordinates centered at (1000, 1000) with radius 400 for clean subtopic expansion
  const { nodes, edges } = useMemo(() => {
    if (!filteredCategories || filteredCategories.length === 0) return { nodes: [], edges: [] };

    // Center Node (PSYCHIATRY KNOWLEDGE MAP)
    const centerNode = {
      id: 'center-psychiatry',
      type: 'center',
      position: { x: 1000 - 128, y: 1000 - 128 },
      data: {
        label: 'PSYCHIATRY',
        subLabel: 'KNOWLEDGE MAP',
        slogan: 'Explore. Connect. Understand.',
        icon: 'Brain',
        color: '#126BEE',
      },
    };

    const count = filteredCategories.length;
    const radius = 400;
    const orbitNodes = [];
    const orbitEdges = [];

    filteredCategories.forEach((cat, index) => {
      // Start angle from top (-PI/2) and rotate clockwise
      const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
      const catX = 1000 + radius * Math.cos(angle);
      const catY = 1000 + radius * Math.sin(angle);

      orbitNodes.push({
        id: `cat-${cat._id}`,
        type: 'orbit',
        position: { x: catX - 80, y: catY - 80 },
        data: {
          id: cat._id,
          label: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          onNodeClick: () => {
            // Clicking any category circle opens its subtopics in-place on this exact screen without redirecting!
            setOpenCategory((prev) => (prev === cat.slug ? null : cat.slug));
          },
        },
      });

      orbitEdges.push({
        id: `edge-center-${cat._id}`,
        source: 'center-psychiatry',
        target: `cat-${cat._id}`,
        type: 'default',
        style: { stroke: `${cat.color}70`, strokeWidth: 2.5 },
        animated: openCategory === cat.slug,
      });

      // Only display Subtopic pills if this category circle is currently clicked/open
      if (openCategory === cat.slug) {
        const subtopics = cat.subtopics || [];
        const subCount = subtopics.length;
        const alignRight = Math.cos(angle) >= 0;
        const subRadiusX = 660;

        subtopics.forEach((sub, subIdx) => {
          const yOffset = (subIdx - (subCount - 1) / 2) * 34;
          const subX = 1000 + subRadiusX * Math.cos(angle) + (alignRight ? 40 : -200);
          const subY = catY + yOffset - 12;

          // Relative positioning so subtopics move seamlessly with the parent circle when dragged
          const relX = subX - (catX - 80);
          const relY = subY - (catY - 80);
          const subNodeId = `sub-${cat._id}-${subIdx}`;

          orbitNodes.push({
            id: subNodeId,
            type: 'subtopic',
            parentId: `cat-${cat._id}`,
            position: { x: relX, y: relY },
            data: {
              label: sub.title,
              slug: sub.slug,
              color: cat.color,
              alignRight: alignRight,
              onNodeClick: () => {
                navigate(`/topic/${sub.slug}`);
              },
            },
          });

          orbitEdges.push({
            id: `edge-${cat._id}-${subNodeId}`,
            source: `cat-${cat._id}`,
            target: subNodeId,
            type: 'default',
            style: { stroke: `${cat.color}45`, strokeWidth: 1.8 },
            animated: true,
          });
        });
      }
    });

    return { nodes: [centerNode, ...orbitNodes], edges: orbitEdges };
  }, [filteredCategories, openCategory, navigate]);

  if (isLoading && !subjectData) {
    return (
      <div className="p-16 text-center text-navy font-extrabold flex flex-col items-center gap-4">
        <Brain className="w-12 h-12 text-primaryBlue animate-bounce" />
        <span className="text-lg">Hydrating Psychiatry Knowledge Map...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <Breadcrumb items={[{ title: 'Home', link: '/' }, { title: 'Psychiatry Core Domain' }]} />

      {/* Hero Header & Switcher */}
      <div className="bg-white border border-borderLine rounded-3xl p-6 lg:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#E9F2FF] text-primaryBlue text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Medical Platform
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-navy tracking-tight mt-2">
            Psychiatry Knowledge Map
          </h1>
          <p className="text-sm md:text-base font-medium text-muted mt-1 max-w-3xl">
            Select any of the 12 clinical specialty orbits below (such as <strong>Child Psychiatry</strong> or <strong>Psycho-Pharmacology</strong>) to reveal its complete diagnostic branch & subtopic hierarchy.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-secondaryBg p-1.5 rounded-2xl border border-borderLine self-stretch md:self-auto justify-center">
          <button
            onClick={() => setViewMode('MAP')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'MAP' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Visual Orbit Map</span>
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'GRID' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grid Study Cards</span>
          </button>
        </div>
      </div>

      {/* Search Bar Filter */}
      <div className="bg-white border border-borderLine rounded-2xl p-3 shadow-soft flex items-center gap-3 transition-all focus-within:border-primaryBlue focus-within:ring-2 focus-within:ring-primaryBlue/15">
        <div className="p-2.5 bg-secondaryBg rounded-xl text-primaryBlue flex items-center justify-center shrink-0">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search domain orbits, clinical topics, or study modules (e.g., ASD, Diagnostics, Schizophrenia)..."
          className="w-full bg-transparent border-none text-navy text-sm font-extrabold placeholder:text-muted placeholder:font-normal focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-muted hover:text-navy transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold px-3"
            title="Clear Search"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Interactive Canvas or Grid Display */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white border border-borderLine rounded-3xl p-16 text-center shadow-soft max-w-2xl mx-auto my-12 animate-fadeIn">
          <div className="w-16 h-16 bg-[#FFF2F2] text-[#DC2626] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-xl font-black text-navy mb-2">No Matching Domains or Subtopics Found</h3>
          <p className="text-sm text-muted font-medium mb-6">
            We couldn't find any study category orbits or clinical subtopics matching "<strong className="text-navy font-bold">{searchQuery}</strong>". Try adjusting your keyword search.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2.5 bg-primaryBlue text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-blue-600 transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      ) : viewMode === 'MAP' ? (
        <div className="relative">
          <MindMapContainer
            initialNodes={nodes}
            initialEdges={edges}
            className="h-[750px] lg:h-[820px]"
            onNodeClick={undefined}
          />
        </div>
      ) : (
        /* Grid Cards Fallback View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
            const IconComp = Icons[cat.icon || 'Compass'] || Icons.Compass;
            return (
              <div
                key={cat._id}
                onClick={() => navigate(`/learn/psychiatry/${cat.slug}`)}
                style={{ borderColor: cat.color }}
                className="bg-white border-2 rounded-3xl p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border border-current/20 group-hover:scale-110 transition-transform"
                    >
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                    >
                      Domain Orbit
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-navy uppercase tracking-tight group-hover:text-primaryBlue transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-semibold text-muted mt-2 mb-3">
                    Click to explore branch pathways, video modules, and board MCQs.
                  </p>

                  {cat.subtopics && cat.subtopics.length > 0 && (
                    <div className="space-y-1.5 mt-3 pt-3 border-t border-borderLine/60">
                      <div className="text-[11px] font-extrabold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span style={{ backgroundColor: cat.color }} className="w-2 h-2 rounded-full inline-block shrink-0" />
                        {cat.subtopics.length} Clinical Subtopics
                      </div>
                      {cat.subtopics.slice(0, 4).map((sub, sIdx) => (
                        <div key={sIdx} className="text-xs font-bold text-slate-700 bg-secondaryBg px-2.5 py-1.5 rounded-lg flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span className="truncate">{sub.title}</span>
                        </div>
                      ))}
                      {cat.subtopics.length > 4 && (
                        <div className="text-[11px] font-extrabold text-primaryBlue px-1 pt-1">
                          + {cat.subtopics.length - 4} more clinical subtopics...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-borderLine flex items-center justify-between text-xs font-bold text-navy group-hover:text-primaryBlue">
                  <span>Explore Subtopics</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectHome;
