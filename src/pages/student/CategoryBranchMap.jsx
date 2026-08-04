import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Network, LayoutGrid, ChevronRight, Sparkles, BookOpen, Puzzle, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import MindMapContainer from '../../components/mindmap/MindMapContainer.jsx';

// Complete dictionary of all 12 categories and their expanded clinical subtopics matching Reference Image 2
const COMPLETE_BRANCH_MAP = [
  {
    _id: 'cat-1', name: 'General Psychiatry', slug: 'general-psychiatry', icon: 'Brain', color: '#126BEE',
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
    _id: 'cat-2', name: 'Core Psychiatry', slug: 'core-psychiatry', icon: 'Stethoscope', color: '#21A447',
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
    _id: 'cat-3', name: 'De-Addiction', slug: 'de-addiction', icon: 'Pill', color: '#F17B18',
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
    _id: 'cat-4', name: 'Neuro-Psychiatry & CLP', slug: 'neuro-psychiatry', icon: 'Activity', color: '#10B981',
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
    _id: 'cat-5', name: 'Geriatric Psychiatry', slug: 'geriatric-psychiatry', icon: 'UserCheck', color: '#7435D5',
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
    _id: 'cat-6', name: 'Special Topics', slug: 'special-topics', icon: 'Star', color: '#3B82F6',
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
    _id: 'cat-7', name: 'Community Psychiatry & Rehab', slug: 'community-psychiatry', icon: 'Users', color: '#0D9488',
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
    _id: 'cat-8', name: 'Forensic Psychiatry', slug: 'forensic-psychiatry', icon: 'Scale', color: '#EA580C',
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
    _id: 'cat-9', name: 'Neuro-Biology', slug: 'neuro-biology', icon: 'Zap', color: '#2563EB',
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
    _id: 'cat-10', name: 'Child Psychiatry', slug: 'child-psychiatry', icon: 'Baby', color: '#06B6D4',
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
    _id: 'cat-11', name: 'Psycho-Pharmacology', slug: 'psycho-pharmacology', icon: 'ShieldPlus', color: '#E11D48',
    subtopics: [
      { title: 'Antidepressant Agents (SSRIs)', slug: 'antidepressants' },
      { title: 'Typical & Atypical Antipsychotics', slug: 'antipsychotics' },
      { title: 'Lithium & Mood Stabilizers', slug: 'mood-stabilizers' },
      { title: 'Anxiolytics & Hypnotics', slug: 'anxiolytics' },
      { title: 'Stimulant Medications', slug: 'stimulants' },
      { title: 'Electroconvulsive Therapy (ECT)', slug: 'ect-therapy' },
      { title: 'Side Effects & Drug Interactions', slug: 'side-effects-management' }
    ]
  },
  {
    _id: 'cat-12', name: 'Psycho-Therapy', slug: 'psycho-therapy', icon: 'MessageSquare', color: '#DB2674',
    subtopics: [
      { title: 'Cognitive Behavioral Therapy (CBT)', slug: 'cbt-therapy' },
      { title: 'Psychodynamic Psychotherapy', slug: 'psychodynamic-therapy' },
      { title: 'Supportive Psychotherapy', slug: 'supportive-therapy' },
      { title: 'Interpersonal Therapy (IPT)', slug: 'interpersonal-therapy' },
      { title: 'Family & Group Modalities', slug: 'family-group-therapy' },
      { title: 'Mindfulness-Based Protocols', slug: 'mindfulness-protocols' }
    ]
  },
];

const CategoryBranchMap = () => {
  const { subjectSlug = 'psychiatry', categorySlug = 'child-psychiatry' } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('RADIAL_MAP'); // Match Screen 2 default visual branch chart
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
    staleTime: 5 * 60 * 1000,
  });

  // Identify current selected category from dictionary for banner display
  const activeCatObj = useMemo(() => {
    return COMPLETE_BRANCH_MAP.find(c => c.slug === (openCategory || categorySlug)) || COMPLETE_BRANCH_MAP.find(c => c.slug === 'child-psychiatry') || COMPLETE_BRANCH_MAP[0];
  }, [openCategory, categorySlug]);

  // Construct React Flow graph containing central hub, 12 domain orbits, and external subtopic pills (Image 2)
  const { nodes, edges } = useMemo(() => {
    const centerNode = {
      id: 'center-hub',
      type: 'center',
      position: { x: 1000 - 128, y: 1000 - 128 }, // Center of canvas at (1000, 1000)
      data: {
        label: 'PSYCHIATRY',
        subLabel: 'KNOWLEDGE MAP',
        slogan: 'Explore. Connect. Understand.',
        icon: 'Brain',
        color: '#126BEE',
      },
    };

    const orbitNodes = [];
    const orbitEdges = [];
    const count = COMPLETE_BRANCH_MAP.length;
    const catRadius = 400; // Distance of 12 domain circles from center

    COMPLETE_BRANCH_MAP.forEach((cat, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const catX = 1000 + catRadius * Math.cos(angle);
      const catY = 1000 + catRadius * Math.sin(angle);

      // Add Category Orbit Node (160x160 circle)
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
            // Toggle subtopics open/closed when clicking the parent category circle without navigating or refreshing
            setOpenCategory(prev => prev === cat.slug ? null : cat.slug);
          },
        },
      });

      // Connect Center Hub to Category Orbit
      orbitEdges.push({
        id: `edge-center-${cat._id}`,
        source: 'center-hub',
        target: `cat-${cat._id}`,
        type: 'default',
        style: { stroke: `${cat.color}70`, strokeWidth: 3 },
        animated: cat.slug === (openCategory || categorySlug), // Highlight active selected category route
      });

      // Only display Subtopic pills if this category circle is currently clicked/open
      if (openCategory === cat.slug) {
        const subtopics = cat.subtopics || [];
        const subCount = subtopics.length;
        const alignRight = Math.cos(angle) >= 0; // Determines which side subtopic pills project towards
        const subRadiusX = 660; // Distance outward for subtopics

        subtopics.forEach((sub, subIdx) => {
          // Stack subtopics vertically relative to category Y position
          const yOffset = (subIdx - (subCount - 1) / 2) * 34;
          const subX = 1000 + subRadiusX * Math.cos(angle) + (alignRight ? 40 : -200);
          const subY = catY + yOffset - 12;

          // Calculate relative position from parent node top-left corner so subtopics travel with parent circle when moved
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
                // CLICKING ANY SUBTOPIC PILL IMMEDIATELY NAVIGATES TO SCREEN 3 (Topic Starburst Map)
                const targetSlug = sub.slug === 'autism-spectrum-disorder' || sub.title.includes('Autism') 
                  ? 'autism-spectrum-disorder' 
                  : sub.slug;
                navigate(`/topic/${targetSlug}`);
              },
            },
          });

          // Edge connecting Category Circle to Subtopic Pill
          orbitEdges.push({
            id: `edge-${cat._id}-${subNodeId}`,
            source: `cat-${cat._id}`,
            target: subNodeId,
            type: 'default',
            style: { stroke: `${cat.color}45`, strokeWidth: 1.8 },
            animated: sub.title.includes('Autism'), // Pulsate target demo route
          });
        });
      }
    });

    return { nodes: [centerNode, ...orbitNodes], edges: orbitEdges };
  }, [categorySlug, openCategory, navigate]);

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
            Psychiatry Subtopic Branch Knowledge Map
          </h1>
          <p className="text-sm font-medium text-muted mt-1 max-w-3xl">
            Here is the fully articulated branch map across all specialties. Click on ANY subtopic pill (such as <strong>Autism Spectrum Disorder (ASD)</strong> under Child Psychiatry) to open its 16-node topic starburst chart.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-secondaryBg p-1.5 rounded-2xl border border-borderLine self-stretch md:self-auto justify-center">
          <button
            onClick={() => setViewMode('RADIAL_MAP')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'RADIAL_MAP' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Expanded Branch Map</span>
          </button>
          <button
            onClick={() => setViewMode('GRID_EXPANDS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'GRID_EXPANDS' ? 'bg-primaryBlue text-white shadow-md' : 'text-muted hover:text-navy'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Subtopic Grid Cards</span>
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
        /* Grid Display of all Category Branches and Subtopics */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPLETE_BRANCH_MAP.map((cat) => {
            const IconComp = Icons[cat.icon || 'Brain'] || Icons.Brain;
            const isSelected = cat.slug === categorySlug;
            return (
              <div
                key={cat._id}
                style={{ borderColor: isSelected ? cat.color : '#E7ECF5', borderWidth: isSelected ? '3px' : '1px' }}
                className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 pb-4 border-b border-borderLine mb-4">
                    <div
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-navy uppercase tracking-tight">{cat.name}</h3>
                      <span className="text-xs font-bold text-muted">{cat.subtopics.length} Clinical Subtopics</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cat.subtopics.map((sub, sIndex) => (
                      <div
                        key={sIndex}
                        onClick={() => navigate(`/topic/${sub.slug === 'autism-spectrum-disorder' || sub.title.includes('Autism') ? 'autism-spectrum-disorder' : sub.slug}`)}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondaryBg hover:bg-white border border-transparent hover:border-primaryBlue hover:shadow-sm cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span style={{ backgroundColor: cat.color }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                          <span className="text-xs md:text-sm font-extrabold text-navy group-hover:text-primaryBlue transition-colors">
                            {sub.title}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted group-hover:text-primaryBlue group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
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
