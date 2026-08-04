import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Sparkles, LayoutGrid, Network, ChevronRight, BookOpen, Clock, Activity, Flame, Award, Bookmark as BookmarkIcon, FileText } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import MindMapContainer from '../../components/mindmap/MindMapContainer.jsx';

// Complete dictionary of all 12 domain orbits and their expanded clinical subtopics
const DEFAULT_CATEGORIES = [
  {
    _id: '1', name: 'Psycho-Therapy', slug: 'psycho-therapy', icon: 'MessageSquare', color: '#DB2674',
    subtopics: [
      { title: 'Cognitive Behavioral Therapy (CBT)', slug: 'cbt-therapy' },
      { title: 'Psychodynamic Psychotherapy', slug: 'psychodynamic-therapy' },
      { title: 'Supportive Psychotherapy', slug: 'supportive-therapy' },
      { title: 'Interpersonal Therapy (IPT)', slug: 'interpersonal-therapy' },
      { title: 'Family & Group Modalities', slug: 'family-group-therapy' },
      { title: 'Mindfulness-Based Protocols', slug: 'mindfulness-protocols' }
    ]
  },
  {
    _id: '2', name: 'General Psychiatry', slug: 'general-psychiatry', icon: 'Brain', color: '#126BEE',
    subtopics: [
      { title: 'Mental Status Examination', slug: 'mental-status-examination' },
      { title: 'Clinical Interview Skills', slug: 'clinical-interview-skills' },
      { title: 'Case Formulation', slug: 'case-formulation' },
      { title: 'Psychiatric Diagnosis', slug: 'psychiatric-diagnosis' },
      { title: 'Treatment Planning', slug: 'treatment-planning' },
      { title: 'Follow Up & Monitoring', slug: 'follow-up-monitoring' },
      { title: 'Ethics & Communication', slug: 'ethics-communication' }
    ]
  },
  {
    _id: '3', name: 'Core Psychiatry', slug: 'core-psychiatry', icon: 'Stethoscope', color: '#21A447',
    subtopics: [
      { title: 'Psychopathology', slug: 'psychopathology' },
      { title: 'Diagnostic Criteria', slug: 'diagnostic-criteria' },
      { title: 'Classification (DSM-5-TR / ICD-11)', slug: 'classification-dsm5' },
      { title: 'Assessment Tools', slug: 'assessment-tools' },
      { title: 'Clinical Rating Scales', slug: 'rating-scales' },
      { title: 'Treatment Principles', slug: 'treatment-principles' },
      { title: 'Prognosis & Outcome', slug: 'prognosis-outcome' }
    ]
  },
  {
    _id: '4', name: 'De-Addiction', slug: 'de-addiction', icon: 'Pill', color: '#F17B18',
    subtopics: [
      { title: 'Substance Use Disorders', slug: 'substance-use-disorders' },
      { title: 'Alcohol Use Disorder', slug: 'alcohol-use-disorder' },
      { title: 'Opioid Use Disorder', slug: 'opioid-use-disorder' },
      { title: 'Cannabis Use Disorder', slug: 'cannabis-use-disorder' },
      { title: 'Nicotine Dependence', slug: 'nicotine-dependence' },
      { title: 'Stimulant Use Disorder', slug: 'stimulant-use-disorder' },
      { title: 'Detoxification & Rehab', slug: 'detox-rehab' }
    ]
  },
  {
    _id: '5', name: 'Neuro-Psychiatry & CLP', slug: 'neuro-psychiatry', icon: 'Activity', color: '#10B981',
    subtopics: [
      { title: 'Neuropsychiatric Disorders', slug: 'neuropsychiatric-disorders' },
      { title: 'Epilepsy & Psychiatry', slug: 'epilepsy-psychiatry' },
      { title: 'Stroke & Mental Health', slug: 'stroke-mental-health' },
      { title: 'Neurocognitive Disorders', slug: 'neurocognitive-disorders' },
      { title: 'Movement Disorders', slug: 'movement-disorders' },
      { title: 'Consultation Liaison Psychiatry', slug: 'consultation-liaison' }
    ]
  },
  {
    _id: '6', name: 'Geriatric Psychiatry', slug: 'geriatric-psychiatry', icon: 'UserCheck', color: '#7435D5',
    subtopics: [
      { title: 'Late Life Depression', slug: 'late-life-depression' },
      { title: 'Dementia Protocols', slug: 'dementia-protocols' },
      { title: 'Delirium Management', slug: 'delirium-management' },
      { title: 'Anxiety in Elderly', slug: 'anxiety-in-elderly' },
      { title: 'Geriatric Psychopharmacology', slug: 'geriatric-psychopharmacology' },
      { title: 'Palliative Care Psychiatry', slug: 'palliative-care-psychiatry' }
    ]
  },
  {
    _id: '7', name: 'Special Topics', slug: 'special-topics', icon: 'Star', color: '#3B82F6',
    subtopics: [
      { title: 'Psychiatric Emergencies', slug: 'psychiatric-emergencies' },
      { title: 'Suicide Prevention Protocols', slug: 'suicide-prevention' },
      { title: 'Violence & Risk Assessment', slug: 'risk-assessment' },
      { title: 'Trauma & PTSD', slug: 'trauma-ptsd' },
      { title: 'Sleep & Wake Disorders', slug: 'sleep-disorders' },
      { title: 'Eating & Feeding Disorders', slug: 'eating-disorders' }
    ]
  },
  {
    _id: '8', name: 'Community Psychiatry & Rehab', slug: 'community-psychiatry', icon: 'Users', color: '#0D9488',
    subtopics: [
      { title: 'Community Mental Health', slug: 'community-mental-health' },
      { title: 'Rehabilitation Services', slug: 'rehab-services' },
      { title: 'Social Skills Training', slug: 'social-skills-training' },
      { title: 'Occupational Rehabilitation', slug: 'occupational-rehab' },
      { title: 'Family Psychoeducation', slug: 'family-psychoeducation' },
      { title: 'Mental Health Policy', slug: 'mental-health-policy' }
    ]
  },
  {
    _id: '9', name: 'Forensic Psychiatry', slug: 'forensic-psychiatry', icon: 'Scale', color: '#EA580C',
    subtopics: [
      { title: 'Medico-legal Aspects', slug: 'medico-legal-aspects' },
      { title: 'Criminal Behavior & Crime', slug: 'criminal-behavior' },
      { title: 'Mental Health Law', slug: 'mental-health-law' },
      { title: 'Forensic Evaluation', slug: 'forensic-evaluation' },
      { title: 'Insanity & Responsibility', slug: 'insanity-responsibility' },
      { title: 'Courtroom Testimony Skills', slug: 'courtroom-skills' }
    ]
  },
  {
    _id: '10', name: 'Neuro-Biology', slug: 'neuro-biology', icon: 'Zap', color: '#2563EB',
    subtopics: [
      { title: 'Neuroanatomy Foundations', slug: 'neuroanatomy' },
      { title: 'Neurotransmitters & Pathways', slug: 'neurotransmitters' },
      { title: 'Neurophysiology Basics', slug: 'neurophysiology' },
      { title: 'Neuroimaging Methods', slug: 'neuroimaging' },
      { title: 'Genetics & Epigenetics', slug: 'genetics-epigenetics' },
      { title: 'Brain & Behavior Matrix', slug: 'brain-behavior' }
    ]
  },
  {
    _id: '11', name: 'Child Psychiatry', slug: 'child-psychiatry', icon: 'Baby', color: '#06B6D4',
    subtopics: [
      { title: 'Neurodevelopmental Disorders', slug: 'autism-spectrum-disorder' },
      { title: 'Autism Spectrum Disorder (ASD)', slug: 'autism-spectrum-disorder' },
      { title: 'Attention Deficit (ADHD)', slug: 'adhd-assessment' },
      { title: 'Behavioral & Conduct Disorders', slug: 'behavioral-disorders' },
      { title: 'Childhood Psychopathology', slug: 'childhood-psychopathology' },
      { title: 'Assessment & Rating Scales', slug: 'child-rating-scales' },
      { title: 'Child Psychopharmacology', slug: 'child-psychopharmacology' }
    ]
  },
  {
    _id: '12', name: 'Psycho-Pharmacology', slug: 'psycho-pharmacology', icon: 'ShieldPlus', color: '#E11D48',
    subtopics: [
      { title: 'Antidepressant Agents (SSRIs)', slug: 'antidepressants' },
      { title: 'Typical & Atypical Antipsychotics', slug: 'antipsychotics' },
      { title: 'Lithium & Mood Stabilizers', slug: 'mood-stabilizers' },
      { title: 'Anxiolytics & Hypnotics', slug: 'anxiolytics' },
      { title: 'Stimulant Medications', slug: 'stimulants' },
      { title: 'Electroconvulsive Therapy (ECT)', slug: 'ect-therapy' },
      { title: 'Side Effects & Drug Interactions', slug: 'side-effects-management' }
    ]
  }
];

const SubjectHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('MAP'); // 'MAP' or 'GRID'
  const [openCategory, setOpenCategory] = useState(null);

  // Fetch Psychiatry subject categories from API
  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subjectCategories', 'psychiatry'],
    queryFn: () => api.get('/subjects/psychiatry/categories'),
    staleTime: 5 * 60 * 1000,
  });

  // Use backend categories if fully populated, otherwise combine/fallback to ensure all 12 appear
  const rawCategories = (subjectData?.categories && subjectData.categories.length > 0) 
    ? subjectData.categories 
    : DEFAULT_CATEGORIES;

  // Ensure every category has consistent color, icon formatting, and subtopics
  const categories = useMemo(() => {
    return rawCategories.map((c, idx) => {
      const fallback = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length];
      const nameStr = (c.name || c.title || fallback.name).toLowerCase();
      const isCoreDomain = ['psychiatry', 'therapy', 'addiction', 'biology', 'forensic', 'community', 'pharmacology', 'special', 'clp'].some(k => nameStr.includes(k)) && !nameStr.includes('test');

      return {
        _id: c._id || c.id || fallback._id,
        name: c.name || c.title || fallback.name,
        slug: c.slug || fallback.slug,
        icon: c.icon || fallback.icon,
        color: c.color || c.themeColor || fallback.color,
        subtopics: c.subtopics || (isCoreDomain ? fallback.subtopics : []),
      };
    });
  }, [rawCategories]);

  // Filter categories by tabs
  const filteredCategories = useMemo(() => {
    if (activeTab === 'CORE') {
      return categories.filter((c) => ['General Psychiatry', 'Core Psychiatry', 'Neuro-Biology', 'Psycho-Pharmacology'].some(val => c.name.includes(val)));
    }
    if (activeTab === 'SPECIALTY') {
      return categories.filter((c) => ['Child Psychiatry', 'Geriatric Psychiatry', 'De-Addiction', 'Forensic Psychiatry'].some(val => c.name.includes(val)));
    }
    if (activeTab === 'THERAPY') {
      return categories.filter((c) => ['Psycho-Therapy', 'Community Psychiatry', 'Special Topics', 'Neuro-Psychiatry'].some(val => c.name.includes(val)));
    }
    return categories;
  }, [categories, activeTab]);

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
                const targetSlug =
                  sub.slug === 'autism-spectrum-disorder' || sub.title.includes('Autism')
                    ? 'autism-spectrum-disorder'
                    : sub.slug;
                navigate(`/topic/${targetSlug}`);
              },
            },
          });

          orbitEdges.push({
            id: `edge-${cat._id}-${subNodeId}`,
            source: `cat-${cat._id}`,
            target: subNodeId,
            type: 'default',
            style: { stroke: `${cat.color}45`, strokeWidth: 1.8 },
            animated: sub.title.includes('Autism'),
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

      {/* Domain Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-borderLine">
        {[
          { key: 'ALL', label: 'All 12 Domain Orbits' },
          { key: 'CORE', label: 'Core Diagnostics & Biology' },
          { key: 'SPECIALTY', label: 'Child, Geriatric & Forensic' },
          { key: 'THERAPY', label: 'Therapeutics & Rehab' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-navy text-white shadow-md scale-105'
                : 'bg-white text-muted hover:bg-slate-100 hover:text-navy border border-borderLine'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Canvas or Grid Display */}
      {viewMode === 'MAP' ? (
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
                  <p className="text-xs font-semibold text-muted mt-2">
                    Click to enter clinical branch pathways, subtopic hierarchies, video modules, and board MCQs.
                  </p>
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
