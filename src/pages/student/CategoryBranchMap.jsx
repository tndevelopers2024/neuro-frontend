import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Network, LayoutGrid, ChevronRight, Sparkles, BookOpen, Puzzle, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import MindMapContainer from '../../components/mindmap/MindMapContainer.jsx';

// Category details and clinical subtopics are loaded dynamically from the backend database via API

const CategoryBranchMap = () => {
  const { subjectSlug = 'psychiatry', categorySlug = 'child-psychiatry' } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('GRID_EXPANDS'); // Show subtopics as individual cards by default when clicking a grid topic
  const [openCategory, setOpenCategory] = useState(categorySlug || 'child-psychiatry');

  React.useEffect(() => {
    if (categorySlug) {
      setOpenCategory(categorySlug);
    }
  }, [categorySlug]);

  // Attempt to fetch dynamic backend branches if present
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['categoryBranches', subjectSlug, categorySlug],
    queryFn: () => api.get(`/categories/${subjectSlug}/${categorySlug}/branches`),
    staleTime: 5 * 1000,
  });

  // Derive active topic category object cleanly from backend API data
  const activeCatObj = useMemo(() => {
    if (categoryData && categoryData.category) {
      return {
        ...categoryData.category,
        subtopics: categoryData.branches || [],
      };
    }
    const fallbackTitle = (categorySlug || 'Topic').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      _id: 'loading',
      name: fallbackTitle,
      slug: categorySlug || '',
      icon: 'Brain',
      color: '#126BEE',
      subtopics: [],
    };
  }, [categoryData, categorySlug]);

  // Construct React Flow graph centering on this specific topic and radiating its clinical subtopics
  const { nodes, edges } = useMemo(() => {
    const centerNode = {
      id: `center-${activeCatObj._id || 'hub'}`,
      type: 'center',
      position: { x: 1000 - 128, y: 1000 - 128 },
      data: {
        label: activeCatObj.name.toUpperCase(),
        subLabel: 'STUDY SUBTOPICS',
        slogan: 'Select any subtopic module below.',
        icon: activeCatObj.icon || 'Brain',
        color: activeCatObj.color || '#126BEE',
      },
    };

    const orbitNodes = [];
    const orbitEdges = [];
    const subtopics = activeCatObj.subtopics || [];
    const count = subtopics.length;
    const radius = 380;

    subtopics.forEach((sub, idx) => {
      const angle = count > 0 ? (idx / count) * 2 * Math.PI - Math.PI / 2 : 0;
      const subX = 1000 + radius * Math.cos(angle);
      const subY = 1000 + radius * Math.sin(angle);
      const subNodeId = `sub-${sub._id || idx}`;

      orbitNodes.push({
        id: subNodeId,
        type: 'orbit',
        position: { x: subX - 80, y: subY - 80 },
        data: {
          id: sub._id,
          label: sub.title || sub.name || 'Subtopic',
          slug: sub.slug,
          icon: sub.icon || activeCatObj.icon || 'Brain',
          color: sub.color || activeCatObj.color || '#126BEE',
          onNodeClick: () => {
            navigate(`/topic/${sub.slug}`);
          },
        },
      });

      orbitEdges.push({
        id: `edge-center-${subNodeId}`,
        source: `center-${activeCatObj._id || 'hub'}`,
        target: subNodeId,
        type: 'default',
        style: { stroke: `${activeCatObj.color || '#126BEE'}70`, strokeWidth: 2.5 },
        animated: true,
      });
    });

    return { nodes: [centerNode, ...orbitNodes], edges: orbitEdges };
  }, [activeCatObj, navigate]);

  if (isLoading && !categoryData) {
    return (
      <div className="p-16 text-center font-extrabold text-navy flex flex-col items-center gap-4">
        <Brain className="w-12 h-12 text-cyan animate-bounce" />
        <span className="text-lg">Loading Complete Medical Branch Tree...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { title: 'Home', link: '/' },
            { title: 'Psychiatry', link: '/' },
            { title: `${activeCatObj.name} Branches` },
          ]}
        />
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-extrabold text-navy hover:text-primaryBlue bg-white px-4 py-2 rounded-2xl border border-borderLine shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Domain Orbits</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="bg-white border border-borderLine rounded-3xl p-6 lg:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span
              style={{ backgroundColor: `${activeCatObj.color}15`, color: activeCatObj.color }}
              className="text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Domain Focus: {activeCatObj.name}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight mt-2.5">
            {activeCatObj.name} Subtopics & Clinical Modules
          </h1>
          <p className="text-sm font-medium text-muted mt-1 max-w-3xl">
            Explore diagnostic branch pathways and study modules under <strong>{activeCatObj.name}</strong>. Click on any subtopic card below (such as <strong>{activeCatObj.subtopics[1]?.title || activeCatObj.subtopics[0]?.title || 'Autism Spectrum Disorder'}</strong>) to open its clinical study deck and module chart.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-secondaryBg p-1.5 rounded-2xl border border-borderLine self-stretch md:self-auto justify-center">
          <button
            onClick={() => setViewMode('GRID_EXPANDS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'GRID_EXPANDS' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Subtopic Grid Cards</span>
          </button>
          <button
            onClick={() => setViewMode('RADIAL_MAP')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'RADIAL_MAP' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Visual Branch Map</span>
          </button>
        </div>
      </div>

      {/* Visual Branch Map vs Grid Display */}
      {viewMode === 'RADIAL_MAP' ? (
        <div className="relative">
          <MindMapContainer
            initialNodes={nodes}
            initialEdges={edges}
            className="h-[800px] lg:h-[880px]"
            onNodeClick={undefined}
          />
        </div>
      ) : (
        /* Grid Display of Subtopics for the selected Related Topic */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeCatObj.subtopics || []).map((sub, sIndex) => {
            const IconComp = Icons[activeCatObj.icon || 'Brain'] || Icons.Brain;
            const targetSlug = sub.slug;

            return (
              <div
                key={sIndex}
                onClick={() => navigate(`/topic/${targetSlug}`)}
                style={{ borderColor: `${activeCatObj.color}50`, borderWidth: '2px' }}
                className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div 
                  style={{ backgroundColor: `${activeCatObj.color}08` }} 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-125" 
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      style={{ backgroundColor: `${activeCatObj.color}15`, color: activeCatObj.color }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-current/20 group-hover:scale-110 transition-transform shadow-sm"
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span
                      style={{ backgroundColor: `${activeCatObj.color}15`, color: activeCatObj.color }}
                      className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span style={{ backgroundColor: activeCatObj.color }} className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" />
                      Module {sIndex + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-navy tracking-tight group-hover:text-primaryBlue transition-colors line-clamp-2">
                    {sub.title}
                  </h3>
                  <p className="text-xs font-semibold text-muted mt-2.5 leading-relaxed">
                    Explore comprehensive diagnostic guidelines, rating scales, neurobiological criteria, and clinical protocols for {sub.title}.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-borderLine flex items-center justify-between text-xs font-bold text-navy group-hover:text-primaryBlue relative z-10">
                  <span className="flex items-center gap-1.5">
                    <Icons.BookOpen className="w-3.5 h-3.5" />
                    Open Study Module
                  </span>
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

export default CategoryBranchMap;
