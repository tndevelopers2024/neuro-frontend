import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Plus, Trash2, Edit, Save, Palette, Sparkles, AlertCircle, ChevronDown, ChevronUp, Layers, CheckCircle2, X, Network, FolderPlus, Play } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { CardSkeleton, TableSkeleton } from '../../components/common/Skeleton.jsx';

// Curated list of medical and educational Lucide icons with labels for visual dropdown
const AVAILABLE_ICONS = [
  { name: 'Brain', label: 'Brain & Neurology', icon: Icons.Brain },
  { name: 'Activity', label: 'Pulse & Activity', icon: Icons.Activity },
  { name: 'Smile', label: 'Child & Mood', icon: Icons.Smile },
  { name: 'Pill', label: 'Psychopharmacology', icon: Icons.Pill },
  { name: 'Microscope', label: 'Research & Labs', icon: Icons.Microscope },
  { name: 'Stethoscope', label: 'Clinical Exam', icon: Icons.Stethoscope },
  { name: 'Heart', label: 'Cardiology & Affect', icon: Icons.Heart },
  { name: 'Eye', label: 'Observation & Vision', icon: Icons.Eye },
  { name: 'Dna', label: 'Genetics & Etiology', icon: Icons.Dna },
  { name: 'Puzzle', label: 'Autism Spectrum (ASD)', icon: Icons.Puzzle },
  { name: 'Cpu', label: 'Schizophrenia Synapse', icon: Icons.Cpu },
  { name: 'Shield', label: 'Forensic & Ethics', icon: Icons.Shield },
  { name: 'Users', label: 'Community & Therapy', icon: Icons.Users },
  { name: 'Globe', label: 'Epidemiology', icon: Icons.Globe },
  { name: 'BookOpen', label: 'Diagnostic DSM-5', icon: Icons.BookOpen },
  { name: 'Clock', label: 'History & Timeline', icon: Icons.Clock },
  { name: 'Zap', label: 'ECT Stimulation', icon: Icons.Zap },
  { name: 'Layers', label: 'Subtopics & Tiers', icon: Icons.Layers },
  { name: 'Compass', label: 'Guidance & Navigation', icon: Icons.Compass },
  { name: 'Sparkles', label: 'Special Topics', icon: Icons.Sparkles },
];

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl.replace('/api', '')}${url}`;
  }
  return url;
};

// Complete clinical dictionary of subtopics for all 12 psychiatry domain orbits
const DOMAIN_SUBTOPICS_MAP = [
  {
    keywords: ['general psychiatry', 'general'],
    subtopics: [
      { title: 'Autism Spectrum Disorder (ASD)', icon: 'Puzzle', description: 'Social-communication deficits and repetitive behaviors.' },
      { title: 'Attention Deficit Hyperactivity Disorder', icon: 'Activity', description: 'Inattention, hyperactivity, and executive dysfunction.' },
      { title: 'Schizophrenia Spectrum Disorders', icon: 'Cpu', description: 'Psychotic symptoms and diagnostic negative domains.' },
      { title: 'Alcohol & Substance Use Disorders', icon: 'Pill', description: 'Neurobiology of craving and physiological withdrawal.' },
      { title: 'Mental Status Examination (MSE)', icon: 'Brain', description: 'Comprehensive mental status evaluation paradigms.' },
      { title: 'Clinical Interview Skills & Ethics', icon: 'Stethoscope', description: 'Doctor-patient communication and clinical ethics.' }
    ]
  },
  {
    keywords: ['core psychiatry', 'core', 'dsm-5', 'icd-11', 'diagnostic'],
    subtopics: [
      { title: 'Psychopathology Foundations', icon: 'BookOpen', description: 'Phenomenology of psychiatric symptoms and signs.' },
      { title: 'Classification Systems (DSM-5-TR & ICD-11)', icon: 'Layers', description: 'Diagnostic criteria and multiaxial evaluation.' },
      { title: 'Clinical Rating Scales & Assessment Tools', icon: 'Activity', description: 'Structured diagnostic questionnaires and rating scales.' },
      { title: 'Treatment Principles & Prognosis', icon: 'Compass', description: 'Evidence-based treatment outcome trajectories.' },
      { title: 'Case Formulation & Differential Diagnosis', icon: 'Brain', description: 'Systematic psychopathological case modeling.' }
    ]
  },
  {
    keywords: ['de-addiction', 'addiction', 'substance'],
    subtopics: [
      { title: 'Alcohol Use Disorder & Withdrawal', icon: 'Pill', description: 'Delirium tremens management and detox protocols.' },
      { title: 'Opioid & Stimulant Use Disorders', icon: 'Zap', description: 'Opioid substitution therapy and overdose paradigms.' },
      { title: 'Cannabis & Hallucinogen Dependence', icon: 'Activity', description: 'Neurobiological addiction mechanisms and rehab.' },
      { title: 'Nicotine Cessation & Behavioral Rehab', icon: 'Heart', description: 'Pharmacotherapy and motivational counseling.' },
      { title: 'Behavioral & Gaming Addictions', icon: 'Puzzle', description: 'Non-substance reward pathway dysregulation.' }
    ]
  },
  {
    keywords: ['neuropsychiatry', 'neuro-psychiatry', 'clp', 'liaison'],
    subtopics: [
      { title: 'Epilepsy & Neurocognitive Comorbidities', icon: 'Cpu', description: 'Seizure disorders and post-ictal manifestations.' },
      { title: 'Consultation-Liaison Psychiatry', icon: 'Stethoscope', description: 'Inpatient hospital consultations and intensive care psychiatry.' },
      { title: 'Movement Disorders & Parkinsonism', icon: 'Activity', description: 'Extrapyramidal symptoms and basal ganglia neurobiology.' },
      { title: 'Stroke & Traumatic Brain Injury (TBI)', icon: 'Brain', description: 'Post-stroke depression and neuropsychiatric rehabilitation.' }
    ]
  },
  {
    keywords: ['geriatric psychiatry', 'geriatric', 'dementia', 'elderly'],
    subtopics: [
      { title: 'Alzheimer Disease & Dementia Protocols', icon: 'Clock', description: 'Memory clinics, cognitive preservation, and staging.' },
      { title: 'Late-Life Depression & Pseudodementia', icon: 'Heart', description: 'Geriatric affective disorders and psychopharmacology.' },
      { title: 'Delirium & Acute Confusion Management', icon: 'AlertCircle', description: 'ICU delirium protocols and etiology investigation.' },
      { title: 'Palliative Mental Health in Aging', icon: 'Shield', description: 'Holistic psychiatric care in advanced aging.' }
    ]
  },
  {
    keywords: ['psycho-therapy', 'psychotherapy', 'therapy', 'cbt'],
    subtopics: [
      { title: 'Cognitive Behavioral Therapy (CBT)', icon: 'Brain', description: 'Cognitive restructuring and behavioral activation.' },
      { title: 'Psychodynamic Psychotherapy', icon: 'Heart', description: 'Unconscious mechanisms, defense analysis, and transference.' },
      { title: 'Supportive & Interpersonal Therapy (IPT)', icon: 'Users', description: 'Grief counseling, empathy protocols, and coping skills.' },
      { title: 'Family & Group Psychotherapy', icon: 'Users', description: 'Systemic dynamics, relational interaction, and group cohesion.' },
      { title: 'Mindfulness-Based Intervention Protocols', icon: 'Sparkles', description: 'Acceptance, stress reduction, and affective regulation.' }
    ]
  },
  {
    keywords: ['child psychiatry', 'child', 'adolescent', 'pediatric'],
    subtopics: [
      { title: 'Autism Spectrum Disorder (ASD)', icon: 'Puzzle', description: 'Pediatric social and neurodevelopmental assessments.' },
      { title: 'Attention Deficit Hyperactivity (ADHD)', icon: 'Activity', description: 'Stimulant medication protocols and school interventions.' },
      { title: 'Conduct & Oppositional Defiant Disorders', icon: 'AlertCircle', description: 'Behavioral modification and parent management training.' },
      { title: 'Childhood Anxiety & Mood Disorders', icon: 'Smile', description: 'Pediatric pharmacotherapeutic safety and affective therapy.' }
    ]
  },
  {
    keywords: ['psycho-pharmacology', 'psychopharmacology', 'pharmacology', 'drugs'],
    subtopics: [
      { title: 'Antidepressant Agents (SSRIs & SNRIs)', icon: 'Pill', description: 'Mechanisms of action, dosing, and serotonergic pathways.' },
      { title: 'Atypical & Typical Antipsychotics', icon: 'Cpu', description: 'Dopamine receptor antagonism and metabolic monitoring.' },
      { title: 'Mood Stabilizers (Lithium & Valproate)', icon: 'Shield', description: 'Therapeutic window monitoring and renoprotection.' },
      { title: 'Anxiolytics, Hypnotics & Sedatives', icon: 'Clock', description: 'GABAergic modulation and dependency tapering protocols.' },
      { title: 'Electroconvulsive Therapy (ECT) Protocols', icon: 'Zap', description: 'Neuromodulation indications, seizure thresholds, and efficacy.' }
    ]
  },
  {
    keywords: ['neuro-biology', 'neurobiology', 'biology', 'anatomy'],
    subtopics: [
      { title: 'Neuroanatomy Foundations', icon: 'Brain', description: 'Limbic system, prefrontal cortex, and thalamic circuits.' },
      { title: 'Neurotransmitters & Receptor Signalling', icon: 'Cpu', description: 'Dopaminergic, serotonergic, and glutamatergic pathways.' },
      { title: 'Genetics & Epigenetic Mechanisms', icon: 'Dna', description: 'Heritability, polymorphisms, and gene-environment interactions.' },
      { title: 'Neuroimaging Methods (MRI & PET)', icon: 'Eye', description: 'Structural and functional neuroimaging anomalies in psychiatric illness.' }
    ]
  },
  {
    keywords: ['forensic psychiatry', 'forensic', 'legal', 'law'],
    subtopics: [
      { title: 'Medico-Legal Aspects & Mental Health Law', icon: 'Shield', description: 'Involuntary admission statutes and patient capacity assessments.' },
      { title: 'Insanity Defense & Competency Evaluation', icon: 'BookOpen', description: 'Criminal court fitness and responsibility evaluations.' },
      { title: 'Risk & Dangerousness Assessment', icon: 'AlertCircle', description: 'Structured risk tools for violence and suicide prevention.' }
    ]
  },
  {
    keywords: ['community psychiatry', 'community', 'rehab', 'social'],
    subtopics: [
      { title: 'Community Mental Health Programs', icon: 'Users', description: 'Outpatient assertive treatment teams and stigma reduction.' },
      { title: 'Occupational & Social Rehabilitation', icon: 'Compass', description: 'Supported employment and social cognitive skills training.' },
      { title: 'Family Psychoeducation & Caregiver Support', icon: 'Heart', description: 'Expressed emotion interventions and psychoeducation groups.' }
    ]
  },
  {
    keywords: ['special topics', 'special', 'emergencies'],
    subtopics: [
      { title: 'Psychiatric Emergencies & Triage', icon: 'AlertCircle', description: 'Acute agitation, neuroleptic malignant syndrome (NMS), and toxicity.' },
      { title: 'Suicide Intervention & Risk Management', icon: 'Activity', description: 'Crisis de-escalation, safety planning, and observation protocols.' },
      { title: 'Trauma & Post-Traumatic Stress (PTSD)', icon: 'Shield', description: 'EMDR, trauma processing, and alpha-blocker therapy.' },
      { title: 'Sleep & Feeding/Eating Disorders', icon: 'Clock', description: 'Polysomnography evaluation, anorexia nervosa refeeding, and bulimia.' }
    ]
  }
];

const getFallbackSubtopicsForCategory = (catName = '', catColor = '#126BEE', catId = '', idx = 0) => {
  const lowerName = catName.toLowerCase().trim();
  const match = DOMAIN_SUBTOPICS_MAP.find(m => m.keywords.some(k => lowerName.includes(k)));
  if (!match) return [];
  
  return match.subtopics.map((item, sidx) => ({
    _id: `default-${catId || idx}-${sidx}`,
    title: item.title,
    level: 2,
    category: catId,
    icon: item.icon || 'Brain',
    color: catColor,
    description: item.description || 'Core clinical guidelines and structured teaching material.'
  }));
};

// Custom Visual Icon Dropdown Component
const IconDropdownSelector = ({ selectedIconName, onChange, color = '#126BEE' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedItem = AVAILABLE_ICONS.find(i => i.name === selectedIconName) || AVAILABLE_ICONS[0];
  const SelectedIconComp = selectedItem.icon;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine flex items-center justify-between hover:border-primaryBlue transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div style={{ backgroundColor: `${color}20`, color: color }} className="p-1.5 rounded-lg border border-current/20">
            <SelectedIconComp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-navy text-left">{selectedItem.name}</span>
            <span className="block text-[10px] text-muted font-normal text-left">{selectedItem.label}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full min-w-[260px] max-h-64 overflow-y-auto bg-white border border-borderLine rounded-lg shadow-elevated p-2 grid grid-cols-1 gap-1 animate-fadeIn left-0">
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wider px-2 py-1 border-b border-borderLine/50 mb-1">
            Select Lucide Icon Symbol
          </div>
          {AVAILABLE_ICONS.map((item) => {
            const IconComponent = item.icon;
            const isSelected = item.name === selectedIconName;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onChange(item.name);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                  isSelected ? 'bg-[#E9F2FF] text-primaryBlue font-bold' : 'hover:bg-secondaryBg text-navy'
                }`}
              >
                <div style={{ backgroundColor: `${color}15`, color: isSelected ? '#126BEE' : color }} className="p-2 rounded-lg">
                  <IconComponent className="w-4 h-4 shrink-0" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{item.name}</div>
                  <div className="text-[10px] text-muted font-normal">{item.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ManageCategories = () => {
  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: 'Brain', color: '#126BEE', displayOrder: 1 });
  const [editingId, setEditingId] = useState(null);

  // Subtopic Modal states
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedParentCat, setSelectedParentCat] = useState(null);
  const [subForm, setSubForm] = useState({ title: '', description: '', icon: 'Puzzle', color: '#126BEE', displayOrder: 1 });
  const [editingSubId, setEditingSubId] = useState(null);

  // Resource Modal states
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedTopicForResource, setSelectedTopicForResource] = useState(null);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    videoUrl: '',
    file: null,
  });

  // MCQ Modal States
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
  const [mcqForm, setMcqForm] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    difficulty: 'Medium',
    explanation: ''
  });

  // Video Preview State
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Drill-down View Stack State
  const [viewStack, setViewStack] = useState([{ type: 'categories', label: 'Domain Categories', data: null }]);
  const currentView = viewStack[viewStack.length - 1];

  const navigateForward = (type, label, data) => {
    setViewStack(prev => [...prev, { type, label, data }]);
  };
  
  const navigateBack = (index) => {
    setViewStack(prev => prev.slice(0, index + 1));
  };

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: resData, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/categories'),
    staleTime: 30 * 1000,
  });
  const categories = resData?.categories || [];

  // Fetch topics/subtopics
  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ['allTopicsAdmin'],
    queryFn: () => api.get('/topics?limit=500'),
    staleTime: 20 * 1000,
  });
  const allTopics = useMemo(() => topData?.topics || [], [topData]);

  // Fetch materials for Level 4 if needed (just fetch all and filter)
  const { data: matData, isLoading: matLoading } = useQuery({
    queryKey: ['allMaterialsAdmin'],
    queryFn: () => api.get('/materials/admin/all'),
    staleTime: 20 * 1000,
  });
  const allMaterials = useMemo(() => matData?.materials || [], [matData]);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlRestored = useRef(false);

  // Sync viewStack -> URL
  useEffect(() => {
    if (!urlRestored.current) return;

    if (viewStack.length > 1) {
      const path = viewStack.slice(1).map(v => {
        let id = '';
        if (v.type === 'subtopics') id = v.data?._id;
        else if (v.type === 'sub-subtopics') id = v.data?.sub?._id;
        else if (v.type === 'resource-types') id = v.data?.child?._id;
        else if (v.type === 'resources') id = `${v.data?.typeId}_${v.data?.child?._id}`;
        return `${v.type}:${id}`;
      }).join(',');
      if (searchParams.get('path') !== path) {
        setSearchParams({ path });
      }
    } else {
      if (searchParams.has('path')) {
        setSearchParams({});
      }
    }
  }, [viewStack, searchParams, setSearchParams]);

  // Sync URL -> viewStack on initial load
  useEffect(() => {
    const path = searchParams.get('path');
    if (!path) {
      urlRestored.current = true;
      return;
    }
    
    if (!urlRestored.current && categories.length > 0 && allTopics.length > 0) {
      const parts = path.split(',');
      const newStack = [{ type: 'categories', label: 'Domain Categories', data: null }];
      
      let currentCat = null;
      let currentSub = null;
      let currentChild = null;

      for (const part of parts) {
        const [type, id] = part.split(':');
        
        if (type === 'subtopics') {
          currentCat = categories.find(c => c._id === id);
          if (currentCat) newStack.push({ type, label: currentCat.name, data: currentCat });
        } else if (type === 'sub-subtopics') {
          currentSub = allTopics.find(t => t._id === id);
          if (currentSub && currentCat) newStack.push({ type, label: currentSub.title, data: { sub: currentSub, cat: currentCat } });
        } else if (type === 'resource-types') {
          currentChild = allTopics.find(t => t._id === id);
          if (currentChild && currentSub && currentCat) newStack.push({ type, label: currentChild.title, data: { child: currentChild, sub: currentSub, cat: currentCat } });
        } else if (type === 'resources') {
          const [typeId, childId] = id.split('_');
          const childObj = allTopics.find(t => t._id === childId) || currentChild;
          if (childObj) {
            const typeLabels = { 'VIDEO': 'Video Lectures', 'NOTES': 'Study Notes', 'MCQ': 'MCQ Assessments' };
            newStack.push({ type, label: typeLabels[typeId] || typeId, data: { child: childObj, typeId } });
          }
        }
      }
      
      if (newStack.length > 1) {
        setViewStack(newStack);
      }
      urlRestored.current = true;
    }
  }, [searchParams, categories, allTopics]);

  // CATEGORY MUTATIONS
  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('✅ Category Orbit updated successfully!');
      } else {
        await api.post('/categories', form);
        toast.success('🎉 New Category Orbit created!');
      }
      queryClient.invalidateQueries();
      setIsCatModalOpen(false);
      setEditingId(null);
      setForm({ name: '', description: '', icon: 'Brain', color: '#126BEE', displayOrder: categories.length + 1 });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('🗑️ Category orbit deleted.');
    },
  });

  const handleDelete = (id, name, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`⚠️ CONFIRM DELETION:\nAre you sure you want to delete Category "${name}" and its linked branches?`)) {
      deleteMutation.mutate(id);
      if (currentView.data?._id === id) navigateBack(0);
    }
  };

  const openNewCategoryModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '', icon: 'Brain', color: '#126BEE', displayOrder: categories.length + 1 });
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (cat, e) => {
    if (e) e.stopPropagation();
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || 'Brain', color: cat.color || '#126BEE', displayOrder: cat.displayOrder || 1 });
    setIsCatModalOpen(true);
  };

  // SUBTOPIC MUTATIONS
  const handleSaveSubtopic = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: subForm.title,
        description: subForm.description,
        icon: subForm.icon,
        color: subForm.color || selectedParentCat?.color || '#126BEE',
        displayOrder: subForm.displayOrder || 1,
        level: selectedParentCat?.isLevel3 ? 3 : 2,
        category: selectedParentCat?.id,
        parentTopic: selectedParentCat?.parentTopic || null,
        slug: subForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      };

      if (editingSubId && !editingSubId.startsWith('sub-') && !editingSubId.startsWith('default-')) {
        await api.put(`/topics/${editingSubId}`, payload);
        toast.success('✅ Subtopic updated successfully!');
      } else {
        await api.post('/topics', payload);
        toast.success('🎉 New Subtopic published!');
      }
      queryClient.invalidateQueries();
      setIsSubModalOpen(false);
      setEditingSubId(null);
      setSubForm({ title: '', description: '', icon: 'Puzzle', color: '#126BEE', displayOrder: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subtopic');
    }
  };

  const deleteSubtopic = async (id, title, e) => {
    if (e) e.stopPropagation();
    if (id.startsWith('default-')) {
      toast.error('Cannot delete fallback placeholder topics. Add a real topic to override them.');
      return;
    }
    if (window.confirm(`Delete subtopic "${title}" from this domain branch?`)) {
      if (!id.startsWith('sub-')) {
        try {
          await api.delete(`/topics/${id}`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete subtopic');
          return;
        }
      }
      queryClient.invalidateQueries();
      toast.success('🗑️ Subtopic removed.');
      if (currentView.data?._id === id) navigateBack(viewStack.length - 2);
    }
  };

  const openAddSubtopicModal = (cat) => {
    setSelectedParentCat({ id: cat._id, name: cat.name, color: cat.color || '#126BEE', icon: cat.icon || 'Puzzle' });
    setEditingSubId(null);
    setSubForm({ title: '', description: '', icon: cat.icon || 'Puzzle', color: cat.color || '#126BEE', displayOrder: 1 });
    setIsSubModalOpen(true);
  };

  const openEditSubtopicModal = (sub, cat, e) => {
    if (e) e.stopPropagation();
    setSelectedParentCat({ id: cat._id, name: cat.name, color: cat.color || '#126BEE', icon: cat.icon || 'Puzzle' });
    setEditingSubId(sub._id);
    setSubForm({ title: sub.title, description: sub.description || '', icon: sub.icon || 'Puzzle', color: sub.color || cat.color || '#126BEE', displayOrder: sub.displayOrder || 1 });
    setIsSubModalOpen(true);
  };

  const openAddLevel3Modal = (sub, cat) => {
    setSelectedParentCat({ 
      id: cat._id, 
      name: `${cat.name} ➔ ${sub.title}`, 
      color: sub.color || cat.color || '#126BEE', 
      icon: sub.icon || cat.icon || 'Puzzle',
      parentTopic: sub._id,
      isLevel3: true 
    });
    setEditingSubId(null);
    setSubForm({ title: '', description: '', icon: sub.icon || cat.icon || 'Puzzle', color: sub.color || cat.color || '#126BEE', displayOrder: 1 });
    setIsSubModalOpen(true);
  };

  const openEditLevel3Modal = (childSub, sub, cat, e) => {
    if (e) e.stopPropagation();
    setSelectedParentCat({ 
      id: cat._id, 
      name: `${cat.name} ➔ ${sub.title}`, 
      color: sub.color || cat.color || '#126BEE', 
      icon: sub.icon || cat.icon || 'Puzzle',
      parentTopic: sub._id,
      isLevel3: true 
    });
    setEditingSubId(childSub._id);
    setSubForm({ title: childSub.title, description: childSub.description || '', icon: childSub.icon || 'Puzzle', color: childSub.color || sub.color || '#126BEE', displayOrder: childSub.displayOrder || 1 });
    setIsSubModalOpen(true);
  };

  // RESOURCE MUTATIONS
  const openAddResourceModal = (topic, typeId) => {
    setSelectedTopicForResource(topic);
    setEditingResourceId(null);
    if (typeId === 'MCQ') {
      setMcqForm({
        question: '', optionA: '', optionB: '', optionC: '', optionD: '',
        correctAnswer: 'A', difficulty: 'Medium', explanation: ''
      });
      setIsMcqModalOpen(true);
    } else {
      setResourceForm({
        title: '',
        description: '',
        type: typeId,
        videoUrl: '',
        file: null,
      });
      setIsResourceModalOpen(true);
    }
  };

  const openEditResourceModal = (mat, topic, typeId) => {
    setSelectedTopicForResource(topic);
    setEditingResourceId(mat._id);
    if (typeId === 'MCQ') {
      // Handle MCQ edit if needed
    } else {
      setResourceForm({
        title: mat.title,
        description: mat.description || '',
        type: typeId,
        videoUrl: mat.videoUrl || '',
        file: null,
      });
      setIsResourceModalOpen(true);
    }
  };

  const deleteResource = async (id, title) => {
    if (window.confirm(`Delete material "${title}"?`)) {
      try {
        await api.delete(`/materials/${id}`);
        queryClient.invalidateQueries({ queryKey: ['allMaterialsAdmin'] });
        toast.success('🗑️ Resource removed.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete resource');
      }
    }
  };

  const saveMcq = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...mcqForm, topic: selectedTopicForResource._id };
      await api.post('/quizzes', payload);
      toast.success('🎉 MCQ added to Assessment Bank!');
      queryClient.invalidateQueries();
      setIsMcqModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save MCQ');
    }
  };

  const saveResource = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', resourceForm.title);
      formData.append('description', resourceForm.description);
      formData.append('type', resourceForm.type);
      formData.append('topic', selectedTopicForResource._id);
      
      if (resourceForm.file) {
        formData.append('file', resourceForm.file);
      }
      if (resourceForm.videoUrl) {
        formData.append('videoUrl', resourceForm.videoUrl);
      }

      if (editingResourceId) {
        await api.put(`/materials/${editingResourceId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('🎉 Resource updated successfully!');
      } else {
        await api.post('/materials/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('🎉 Resource published to Lesson!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['allMaterialsAdmin'] });
      setIsResourceModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save resource');
    }
  };

  // --- RENDER HELPERS ---

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {viewStack.map((view, idx) => (
        <React.Fragment key={idx}>
          <button
            onClick={() => navigateBack(idx)}
            className={`text-[13px] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              idx === viewStack.length - 1 ? 'text-primaryBlue bg-primaryBlue/10 px-3 py-1.5 rounded-lg' : 'text-muted hover:text-navy px-1'
            }`}
          >
            {idx === 0 && <Layers className="w-4 h-4" />}
            {view.label}
          </button>
          {idx < viewStack.length - 1 && <span className="text-muted/40 font-bold">/</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCategories = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => {
        const CatIconComp = Icons[cat.icon || 'Brain'] || Icons.Brain;
        return (
          <div
            key={cat._id}
            onClick={() => navigateForward('subtopics', cat.name, cat)}
            style={{ borderTopColor: cat.color || '#126BEE' }}
            className="bg-white border border-borderLine border-t-[8px] rounded-xl p-6 shadow-soft hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  style={{ backgroundColor: `${cat.color || '#126BEE'}15`, color: cat.color || '#126BEE' }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center border border-current/20 shadow-xs shrink-0 group-hover:scale-110 transition-transform"
                >
                  <CatIconComp className="w-6 h-6" />
                </div>
                <div>
                  <span style={{ backgroundColor: `${cat.color || '#126BEE'}15`, color: cat.color || '#126BEE' }} className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Order #${cat.displayOrder || idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-navy mt-1.5 leading-tight group-hover:text-primaryBlue transition-colors">{cat.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => openEditCategoryModal(cat, e)}
                  className="p-2.5 rounded-xl bg-secondaryBg hover:bg-white text-navy hover:text-primaryBlue border border-borderLine shadow-xs transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(cat._id, cat.name, e)}
                  className="p-2.5 rounded-xl bg-secondaryBg hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] border border-borderLine shadow-xs transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs font-medium text-muted leading-relaxed">
              {cat.description || 'Clinical diagnostics, evaluation paradigms, and structured treatment guidelines.'}
            </p>
          </div>
        );
      })}
      </div>
    );
  };

  const renderSubtopics = (cat) => {
    if (topLoading) return <TableSkeleton rows={4} columns={3} />;
    const dbSubtopics = allTopics.filter(t => 
      ((t.category?._id === cat._id) || (t.category === cat._id) || (typeof t.category === 'string' && t.category === cat._id?.toString())) &&
      (!t.parentTopic || t.parentTopic === null || t.parentTopic === '')
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-borderLine shadow-sm">
          <p className="text-sm font-medium text-navy">Manage all Level 2 Subtopics under <strong>{cat.name}</strong></p>
          <button
            onClick={() => openAddSubtopicModal(cat)}
            className="px-4 py-2 rounded-xl bg-[#EAF7ED] hover:bg-[#D5EEDC] text-medicalGreen font-bold text-xs flex items-center gap-1 transition-all border border-medicalGreen/20 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Subtopic
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Topic Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dbSubtopics.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-400 text-sm font-semibold">
                      No subtopics attached yet. Click "Add Subtopic" to add nodes!
                    </td>
                  </tr>
                ) : (
                  dbSubtopics.map((sub) => {
                    const SubIconComp = Icons[sub.icon || 'Puzzle'] || Icons.Puzzle;
                    return (
                      <tr 
                        key={sub._id} 
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                        onClick={() => navigateForward('sub-subtopics', sub.title, { sub, cat })}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div style={{ color: sub.color || cat.color || '#126BEE', backgroundColor: `${sub.color || cat.color || '#126BEE'}15` }} className="p-2.5 rounded-lg shrink-0">
                              <SubIconComp className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm group-hover:text-primaryBlue transition-colors">{sub.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-gray-500 line-clamp-2">{sub.description}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditSubtopicModal(sub, cat, e); }}
                              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primaryBlue transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSubtopic(sub._id, sub.title, e); }}
                              className="p-2 rounded-lg text-gray-400 hover:bg-[#FFF2F2] hover:text-[#DC2626] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSubSubtopics = ({ sub, cat }) => {
    if (topLoading) return <TableSkeleton rows={4} columns={3} />;
    const childSubtopics = allTopics.filter(t => {
      const pId = t.parentTopic?._id || t.parentTopic;
      return pId && pId.toString() === sub._id?.toString();
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-borderLine shadow-sm">
          <p className="text-sm font-medium text-navy">Manage all Level 3 Sub-subtopics under <strong>{sub.title}</strong></p>
          <button
            onClick={() => openAddLevel3Modal(sub, cat)}
            className="px-4 py-2 rounded-xl bg-[#E9F2FF] hover:bg-primaryBlue text-primaryBlue hover:text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Sub-Subtopic
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Sub-Topic Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {childSubtopics.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-400 text-sm font-semibold">
                      No sub-subtopics attached yet. Click "Add Sub-Subtopic" to add nodes!
                    </td>
                  </tr>
                ) : (
                  childSubtopics.map((child) => {
                    const ChildIconComp = Icons[child.icon || 'BookOpen'] || Icons.BookOpen;
                    return (
                      <tr 
                        key={child._id} 
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                        onClick={() => navigateForward('resource-types', child.title, { child, sub, cat })}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div style={{ color: child.color || sub.color || '#8B5CF6', backgroundColor: `${child.color || sub.color || '#8B5CF6'}15` }} className="p-2.5 rounded-lg shrink-0">
                              <ChildIconComp className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm group-hover:text-primaryBlue transition-colors">{child.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-gray-500 line-clamp-2">{child.description}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditLevel3Modal(child, sub, cat, e); }}
                              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primaryBlue transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSubtopic(child._id, child.title, e); }}
                              className="p-2 rounded-lg text-gray-400 hover:bg-[#FFF2F2] hover:text-[#DC2626] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceTypes = ({ child }) => {
    const types = [
      { id: 'VIDEO', label: 'Video Lectures', icon: Icons.Video, color: '#DB2674', desc: 'Manage video content and lectures' },
      { id: 'NOTES', label: 'Documents & Notes', icon: Icons.FileText, color: '#13A7B5', desc: 'Manage PDFs and rich text notes' },
      { id: 'MCQ', label: 'MCQs & Quizzes', icon: Icons.CheckSquare, color: '#F17B18', desc: 'Manage practice questions' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {types.map(t => {
          const TIcon = t.icon;
          return (
            <div 
              key={t.id}
              onClick={() => navigateForward('resources', t.label, { child, typeId: t.id })}
              className="bg-white border border-borderLine rounded-xl p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3"
            >
              <div style={{ backgroundColor: `${t.color}15`, color: t.color }} className="w-16 h-16 rounded-2xl flex items-center justify-center">
                <TIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">{t.label}</h3>
                <p className="text-xs text-muted font-medium mt-1">{t.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const renderResourcesTable = ({ child, typeId }) => {
    if (matLoading) return <TableSkeleton rows={5} columns={4} />;
    // Filter materials
    const materials = allMaterials.filter(m => {
       const mTopicId = m.topic?._id || m.topic;
       return mTopicId?.toString() === child._id?.toString() && m.type === typeId;
    });

    return (
      <div className="bg-white rounded-xl border border-borderLine shadow-soft overflow-hidden">
        <div className="p-5 border-b border-borderLine flex items-center justify-between">
          <h3 className="text-base font-bold text-navy">Registered {currentView.label}</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open(`/lesson/${child.slug}`, '_blank')}
              className="px-4 py-2 bg-white text-primaryBlue border border-borderLine text-xs font-bold rounded-lg shadow-sm hover:bg-secondaryBg transition-colors flex items-center gap-1.5"
            >
               <Play className="w-3.5 h-3.5 fill-current" /> Preview as Student
            </button>
            <button 
              onClick={() => openAddResourceModal(child, typeId)}
              className="px-4 py-2 bg-primaryBlue text-white text-xs font-bold rounded-lg shadow-md hover:bg-navy transition-colors flex items-center gap-1.5"
            >
               <Plus className="w-3.5 h-3.5" /> Add New Resource
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondaryBg text-muted font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-lg">Title</th>
                <th className="p-4">Description</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted text-sm font-medium">
                    No resources found. Click "Add New Resource" to upload content.
                  </td>
                </tr>
              ) : (
                materials.map(mat => (
                  <tr key={mat._id} className="hover:bg-secondaryBg/40 transition-colors">
                    <td className="p-4 font-semibold text-navy">{mat.title}</td>
                    <td className="p-4 text-muted text-sm max-w-xs truncate" title={mat.description}>{mat.description || '-'}</td>
                    <td className="p-4 text-muted font-medium">
                      <span className="px-2 py-1 bg-secondaryBg text-navy rounded text-[10px] font-bold uppercase">{mat.type || typeId}</span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {typeId === 'VIDEO' && mat.videoUrl && (
                        <button onClick={() => setPreviewVideo(mat.videoUrl)} className="p-1.5 text-muted hover:text-primaryBlue transition-colors" title="Play Video">
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      )}
                      {typeId === 'NOTES' && mat.fileUrl && (
                        <button onClick={() => setPreviewDoc(getFileUrl(mat.fileUrl))} className="p-1.5 text-muted hover:text-primaryBlue transition-colors" title="View Document">
                          <Icons.Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEditResourceModal(mat, child, typeId)} className="p-1.5 text-muted hover:text-primaryBlue transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteResource(mat._id, mat.title)} className="p-1.5 text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 relative">
      {/* Header Banner */}
      <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-9 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan/10 via-primaryBlue/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#EAF9FB] text-cyan text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Activity className="w-3.5 h-3.5" /> Domain Orbits Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight">
            Manage Category Orbits & Subtopics
          </h1>
          <p className="text-sm font-medium text-muted mt-2 leading-relaxed">
            Drill down through categories to manage subtopics, sub-subtopics, and related study materials seamlessly.
          </p>
        </div>

        {currentView.type === 'categories' && (
          <button
            onClick={openNewCategoryModal}
            className="btn-primary px-6 py-4 rounded-lg font-semibold text-xs flex items-center gap-2.5 shadow-lg hover:scale-[1.02] transition-transform relative z-10 whitespace-nowrap bg-primaryBlue"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create New Category Orbit</span>
          </button>
        )}
      </div>

      {renderBreadcrumbs()}

      {/* Main Content Area based on current view */}
      <div className="animate-fadeIn">
        {currentView.type === 'categories' && renderCategories()}
        {currentView.type === 'subtopics' && renderSubtopics(currentView.data)}
        {currentView.type === 'sub-subtopics' && renderSubSubtopics(currentView.data)}
        {currentView.type === 'resource-types' && renderResourceTypes(currentView.data)}
        {currentView.type === 'resources' && renderResourcesTable(currentView.data)}
      </div>

      {/* ======================= MODAL 1: CATEGORY ORBIT POPUP DIALOG ======================= */}
      {isCatModalOpen && (
        <div className="!mt-0 fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsCatModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondaryBg text-muted hover:text-navy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6 border-b border-borderLine pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF9FB] text-cyan flex items-center justify-center font-bold">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-navy">
                  {editingId ? 'Edit Category Orbit' : 'Create New Category Orbit'}
                </h3>
                <p className="text-xs text-muted font-medium">Updates immediately appear across all student mind map branches.</p>
              </div>
            </div>

            <form onSubmit={saveCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Category Domain Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., General Psychiatry"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Visual Icon Dropdown *</label>
                  <IconDropdownSelector
                    selectedIconName={form.icon}
                    onChange={(newIcon) => setForm({ ...form, icon: newIcon })}
                    color={form.color}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Domain Hex Color Theme</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-12 h-12 p-1 rounded-xl bg-secondaryBg border border-borderLine cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="#126BEE"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                      className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-navy outline-none focus:border-primaryBlue uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Display Order #</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Domain Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Psychopathological evaluation, diagnostic criteria and clinical management."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue resize-none"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-borderLine">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="btn-secondary text-xs px-6 py-3.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-8 py-3.5 shadow-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Update Orbit on Student Maps' : 'Publish Orbit to Curriculum'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: SUBTOPIC NODE POPUP DIALOG ======================= */}
      {isSubModalOpen && selectedParentCat && (
        <div className="!mt-0 fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-elevated max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsSubModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondaryBg text-muted hover:text-navy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-borderLine pb-4">
              <div
                style={{ backgroundColor: `${selectedParentCat.color}20`, color: selectedParentCat.color }}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border border-current/20"
              >
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">
                  {editingSubId ? `Edit Subtopic Node in "${selectedParentCat.name}"` : `Attach Subtopic to "${selectedParentCat.name}"`}
                </h3>
                <p className="text-xs text-muted font-medium">This node will render dynamically on Screen 2 Subtopic Trees.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSubtopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Subtopic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Autism Spectrum Disorder"
                  value={subForm.title}
                  onChange={(e) => setSubForm({ ...subForm, title: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Visual Icon Dropdown *</label>
                  <IconDropdownSelector
                    selectedIconName={subForm.icon}
                    onChange={(newIcon) => setSubForm({ ...subForm, icon: newIcon })}
                    color={selectedParentCat.color}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Display Order #</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={subForm.displayOrder}
                    onChange={(e) => setSubForm({ ...subForm, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-navy outline-none focus:border-medicalGreen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Clinical Overview & Description</label>
                <textarea
                  rows={2}
                  placeholder="Short clinical overview displayed on student study cards and hover boxes..."
                  value={subForm.description}
                  onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-medicalGreen resize-none"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-borderLine">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="btn-secondary text-xs px-6 py-3.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary bg-medicalGreen hover:bg-[#1C8A3B] text-xs px-8 py-3.5 shadow-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSubId ? 'Save & Update Subtopic' : 'Publish Subtopic Node'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 3: RESOURCE UPLOAD DIALOG ======================= */}
      {isResourceModalOpen && selectedTopicForResource && (
        <div className="!mt-0 fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-elevated max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsResourceModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondaryBg text-muted hover:text-navy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 border-b border-borderLine pb-4">
              <h3 className="text-lg font-bold text-navy">Add New Resource</h3>
              <p className="text-xs text-muted font-medium">Topic: {selectedTopicForResource.title}</p>
            </div>

            <form onSubmit={saveResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Watch Video: Evolution of ASD Diagnostic Concepts"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Study Card Description</label>
                <textarea
                  rows={2}
                  placeholder="Clinical description shown on Screen 4 interactive cards..."
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue resize-none"
                />
              </div>

              {resourceForm.type === 'VIDEO' && (
                <div className="p-5 rounded-xl border border-red-200 bg-red-50/30">
                  <div className="text-xs font-bold mb-3 uppercase flex items-center gap-2 text-red-500">
                    <Icons.Video className="w-4 h-4" />
                    LINK YOUTUBE LECTURE
                  </div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">YouTube Video Link *</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    value={resourceForm.videoUrl || ''}
                    onChange={(e) => setResourceForm({ ...resourceForm, videoUrl: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-medium text-sm text-navy outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-muted font-medium mt-3 flex items-center gap-1.5">
                    <span>🔒</span> Students will watch this video in a restricted player to prevent sharing.
                  </p>
                </div>
              )}

              {resourceForm.type === 'NOTES' && (
                <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30">
                  <div className="text-xs font-bold mb-3 uppercase flex items-center gap-2 text-primaryBlue">
                    <Icons.FileText className="w-4 h-4" />
                    UPLOAD NOTES FILE
                  </div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Attach PDF File *</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files[0] })}
                    className="w-full text-sm text-navy file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primaryBlue file:text-white hover:file:bg-navy transition-all"
                  />
                  <p className="text-[10px] text-muted font-medium mt-3 flex items-center gap-1.5">
                    <span>🔒</span> Students will read this document exclusively inside the app.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-borderLine mt-6">
                <button type="submit" className="btn-primary px-6 py-3.5 text-xs font-bold bg-primaryBlue hover:bg-navy text-white rounded-lg shadow-md flex items-center gap-2 transition-colors">
                  <Icons.Upload className="w-4 h-4" />
                  Publish Learning Material to Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 4: MCQ UPLOAD DIALOG ======================= */}
      {isMcqModalOpen && selectedTopicForResource && (
        <div className="!mt-0 fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsMcqModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondaryBg text-muted hover:text-navy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 border-b border-borderLine pb-4">
              <h3 className="text-lg font-bold text-navy">Add New Resource</h3>
              <p className="text-xs text-muted font-medium">Topic: {selectedTopicForResource.title}</p>
            </div>

            <form onSubmit={saveMcq} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Correct Answer Key *</label>
                  <select
                    value={mcqForm.correctAnswer}
                    onChange={(e) => setMcqForm({ ...mcqForm, correctAnswer: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-medicalGreen outline-none focus:border-primaryBlue"
                  >
                    <option value="A">Option A (Correct Answer)</option>
                    <option value="B">Option B (Correct Answer)</option>
                    <option value="C">Option C (Correct Answer)</option>
                    <option value="D">Option D (Correct Answer)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Difficulty Tier *</label>
                  <select
                    value={mcqForm.difficulty}
                    onChange={(e) => setMcqForm({ ...mcqForm, difficulty: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue"
                  >
                    <option value="Easy">🟢 Easy</option>
                    <option value="Medium">🟡 Medium (Clinical Vignette)</option>
                    <option value="Hard">🔴 Hard</option>
                    <option value="Clinical Case">🟣 Clinical Case</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Clinical Question Text / Vignette *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Which of the following typical or atypical psychotropic agents is formally indicated for..."
                  value={mcqForm.question}
                  onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-secondaryBg/40 border border-borderLine rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Option A Text *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option A answer choice..."
                    value={mcqForm.optionA}
                    onChange={(e) => setMcqForm({ ...mcqForm, optionA: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Option B Text *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option B answer choice..."
                    value={mcqForm.optionB}
                    onChange={(e) => setMcqForm({ ...mcqForm, optionB: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Option C Text *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option C answer choice..."
                    value={mcqForm.optionC}
                    onChange={(e) => setMcqForm({ ...mcqForm, optionC: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy text-left mb-1.5">Option D Text *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option D answer choice..."
                    value={mcqForm.optionD}
                    onChange={(e) => setMcqForm({ ...mcqForm, optionD: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy text-left mb-1.5">Detailed Clinical Rationale / Explanation *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why the correct answer is right and why distractors are contraindicated..."
                  value={mcqForm.explanation}
                  onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-borderLine mt-6">
                <button type="submit" className="btn-primary px-6 py-3.5 text-xs font-bold bg-medicalGreen hover:bg-[#1C8A3B] text-white rounded-lg shadow-md flex items-center gap-2 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Add Question to Assessment Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Popup Modal */}
      {previewDoc && (
        <div className="!mt-0 fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-borderLine flex justify-between items-center bg-secondaryBg/50">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Icons.FileText className="w-5 h-5 text-primaryBlue" />
                Document Preview
              </h2>
              <button onClick={() => setPreviewDoc(null)} className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 bg-secondaryBg h-[80vh]">
              <iframe
                src={previewDoc}
                title="Document Preview"
                className="w-full h-full border-0 rounded-b-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Popup Modal */}
      {previewVideo && (
        <div className="!mt-0 fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-borderLine flex justify-between items-center bg-secondaryBg/50">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Play className="w-5 h-5 text-primaryBlue fill-current" />
                Video Preview
              </h2>
              <button onClick={() => setPreviewVideo(null)} className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black">
              {previewVideo && (previewVideo.includes('youtube.com') || previewVideo.includes('youtu.be')) ? (
                <iframe
                  className="w-full aspect-video max-h-[70vh] rounded-lg"
                  src={(() => {
                    const match = previewVideo.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : previewVideo;
                  })()}
                  title="Video Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={previewVideo} 
                  controls 
                  autoPlay 
                  className="w-full h-auto max-h-[70vh] rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
