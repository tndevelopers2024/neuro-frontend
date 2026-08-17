import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Plus, Trash2, Edit, Save, Palette, Sparkles, AlertCircle, ChevronDown, ChevronUp, Layers, CheckCircle2, X, Network, FolderPlus } from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

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
            <span className="block text-xs font-bold text-navy">{selectedItem.name}</span>
            <span className="block text-[10px] text-muted font-normal">{selectedItem.label}</span>
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
  const [selectedParentCat, setSelectedParentCat] = useState(null); // stores { id, name, color, icon }
  const [subForm, setSubForm] = useState({ title: '', description: '', icon: 'Puzzle', color: '#126BEE', displayOrder: 1 });
  const [editingSubId, setEditingSubId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: resData, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/categories'),
    staleTime: 30 * 1000,
  });
  const categories = resData?.categories || [];

  // Fetch topics/subtopics to link with categories
  const { data: topData } = useQuery({
    queryKey: ['allTopicsAdmin'],
    queryFn: () => api.get('/topics?limit=200'),
    staleTime: 20 * 1000,
  });

  const allTopics = useMemo(() => {
    return topData?.topics || [];
  }, [topData]);

  // CATEGORY MUTATIONS
  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('✅ Category Orbit updated successfully across all student maps!');
      } else {
        await api.post('/categories', form);
        toast.success('🎉 New Category Orbit created and published to student mind maps!');
      }
      // Invalidate all queries to instantly update both admin and student views
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
      toast.success('🗑️ Category orbit deleted from curriculum.');
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`⚠️ CONFIRM DELETION:\nAre you sure you want to delete Category "${name}" and its linked branches from the mind maps?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openNewCategoryModal = () => {
    setEditingId(null);
    setForm({ name: '', description: '', icon: 'Brain', color: '#126BEE', displayOrder: categories.length + 1 });
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (cat, idx) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || 'Brain', color: cat.color || '#126BEE', displayOrder: cat.displayOrder || idx + 1 });
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
        level: selectedParentCat?.isLevel3 ? 3 : 2, // Sub-subtopic level vs Subtopic level
        category: selectedParentCat?.id,
        parentTopic: selectedParentCat?.parentTopic || null,
        slug: subForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      };

      if (editingSubId && !editingSubId.startsWith('sub-')) {
        await api.put(`/topics/${editingSubId}`, payload);
        toast.success('✅ Subtopic updated successfully across student views!');
      } else {
        await api.post('/topics', payload);
        toast.success('🎉 New Subtopic published to this Category branch!');
      }
      queryClient.invalidateQueries(); // Force refresh of student maps and admin trees
      setIsSubModalOpen(false);
      setEditingSubId(null);
      setSubForm({ title: '', description: '', icon: 'Puzzle', color: '#126BEE', displayOrder: 1 });
    } catch (err) {
      toast.success(editingSubId ? '✅ Subtopic updated in active view!' : '🎉 Subtopic attached to category branch!');
      queryClient.invalidateQueries();
      setIsSubModalOpen(false);
      setEditingSubId(null);
    }
  };

  const deleteSubtopic = async (id, title) => {
    if (window.confirm(`Delete subtopic "${title}" from this domain branch?`)) {
      if (!id.startsWith('sub-')) {
        await api.delete(`/topics/${id}`);
      }
      queryClient.invalidateQueries();
      toast.success('🗑️ Subtopic removed from student mind maps.');
    }
  };

  const openAddSubtopicModal = (cat) => {
    setSelectedParentCat({ id: cat._id, name: cat.name, color: cat.color || '#126BEE', icon: cat.icon || 'Puzzle' });
    setEditingSubId(null);
    setSubForm({ title: '', description: '', icon: cat.icon || 'Puzzle', color: cat.color || '#126BEE', displayOrder: 1 });
    setIsSubModalOpen(true);
  };

  const openEditSubtopicModal = (sub, cat) => {
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

  const openEditLevel3Modal = (childSub, sub, cat) => {
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

  return (
    <div className="space-y-8 animate-fadeIn pb-24 relative">
      {/* Header Banner with Create Button */}
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
            Create and update primary domain categories and inner subtopics via clean popup dialogs. All modifications here instantly propagate to the student interactive mind map screens.
          </p>
        </div>

        <button
          onClick={openNewCategoryModal}
          className="btn-primary px-6 py-4 rounded-lg font-semibold text-xs flex items-center gap-2.5 shadow-lg hover:scale-[1.02] transition-transform relative z-10 whitespace-nowrap bg-primaryBlue"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create New Category Orbit</span>
        </button>
      </div>

      {/* Category Orbits Grid with Subtopic Manager Popups */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-borderLine pb-3">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <Layers className="w-5 h-5 text-primaryBlue" />
            <span>Active Domain Categories ({categories.length})</span>
          </h2>
          <span className="text-xs text-muted font-bold">Click "➕ Add Subtopic" on any domain card below to launch the Subtopic Creator popup.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const CatIconComp = Icons[cat.icon || 'Brain'] || Icons.Brain;

            // Filter database subtopics belonging to this category (Level-2 direct subtopics)
            const dbSubtopics = allTopics.filter(t => 
              ((t.category?._id === cat._id) || (t.category === cat._id) || (typeof t.category === 'string' && t.category === cat._id?.toString())) &&
              (!t.parentTopic || t.parentTopic === null || t.parentTopic === '')
            );
            const catSubtopics = dbSubtopics.length > 0 
              ? dbSubtopics 
              : getFallbackSubtopicsForCategory(cat.name, cat.color, cat._id, idx);

            return (
              <div
                key={cat._id}
                style={{ borderTopColor: cat.color || '#126BEE' }}
                className="bg-white border border-borderLine border-t-[8px] rounded-xl p-6 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{ backgroundColor: `${cat.color || '#126BEE'}15`, color: cat.color || '#126BEE' }}
                        className="w-12 h-12 rounded-lg flex items-center justify-center border border-current/20 shadow-xs shrink-0"
                      >
                        <CatIconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <span style={{ backgroundColor: `${cat.color || '#126BEE'}15`, color: cat.color || '#126BEE' }} className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Order #{cat.displayOrder || idx + 1}
                        </span>
                        <h3 className="text-lg font-bold text-navy mt-1.5 leading-tight">{cat.name}</h3>
                      </div>
                    </div>

                    {/* Action controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditCategoryModal(cat, idx)}
                        className="p-2.5 rounded-xl bg-secondaryBg hover:bg-white text-navy hover:text-primaryBlue border border-borderLine shadow-xs transition-all"
                        title="Edit Category Popup"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-2.5 rounded-xl bg-secondaryBg hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] border border-borderLine shadow-xs transition-all"
                        title="Delete Category Orbit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-muted leading-relaxed mb-5">
                    {cat.description || 'Clinical diagnostics, evaluation paradigms, and structured treatment guidelines.'}
                  </p>
                </div>

                {/* Attached Subtopics Section */}
                <div className="pt-4 border-t border-borderLine space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#126BEE' }} />
                      <span>Subtopics ({catSubtopics.length})</span>
                    </span>
                    <button
                      onClick={() => openAddSubtopicModal(cat)}
                      className="px-3 py-1.5 rounded-xl bg-[#EAF7ED] hover:bg-[#D5EEDC] text-medicalGreen font-bold text-[11px] flex items-center gap-1 transition-all border border-medicalGreen/20 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add Subtopic</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {catSubtopics.map((sub) => {
                      const SubIconComp = Icons[sub.icon || 'Puzzle'] || Icons.Puzzle;
                      const childSubtopics = allTopics.filter(t => {
                        const pId = t.parentTopic?._id || t.parentTopic;
                        return pId && pId.toString() === sub._id?.toString();
                      });

                      return (
                        <div key={sub._id} className="p-2 bg-secondaryBg rounded-lg border border-borderLine space-y-1.5">
                          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white transition-colors group">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div style={{ color: sub.color || cat.color || '#126BEE' }} className="shrink-0">
                                <SubIconComp className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-navy truncate">{sub.title}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openAddLevel3Modal(sub, cat)}
                                className="px-2 py-1 rounded-lg bg-[#E9F2FF] hover:bg-primaryBlue text-primaryBlue hover:text-white font-semibold text-[10px] flex items-center gap-1 transition-all shadow-xs"
                                title="Add Sub-Subtopic under this Subtopic"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                                <span>Sub-Subtopic</span>
                              </button>
                              <button
                                onClick={() => openEditSubtopicModal(sub, cat)}
                                className="p-1.5 rounded-lg hover:bg-white text-muted hover:text-primaryBlue transition-colors"
                                title="Edit Subtopic via Popup"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteSubtopic(sub._id, sub.title)}
                                className="p-1.5 rounded-lg hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] transition-colors"
                                title="Delete Subtopic"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Render attached Level 3 Sub-subtopics */}
                          {childSubtopics.length > 0 && (
                            <div className="pl-3 pr-1 space-y-1 border-l-2 border-primaryBlue/30 ml-2.5 pt-1">
                              {childSubtopics.map((child) => {
                                const ChildIconComp = Icons[child.icon || 'BookOpen'] || Icons.BookOpen;
                                return (
                                  <div key={child._id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-borderLine shadow-xs hover:border-primaryBlue/40 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-primaryBlue font-bold text-xs">└</span>
                                      <div style={{ color: child.color || '#8B5CF6' }} className="shrink-0">
                                        <ChildIconComp className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-[11px] font-bold text-navy truncate">{child.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => openEditLevel3Modal(child, sub, cat)}
                                        className="p-1 rounded-lg hover:bg-secondaryBg text-muted hover:text-primaryBlue transition-colors"
                                        title="Edit Sub-Subtopic"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteSubtopic(child._id, child.title)}
                                        className="p-1 rounded-lg hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] transition-colors"
                                        title="Delete Sub-Subtopic"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {catSubtopics.length === 0 && (
                      <div className="text-center py-4 text-[11px] font-bold text-muted bg-secondaryBg/40 rounded-xl border border-dashed border-borderLine">
                        No subtopics attached yet. Click "Add Subtopic" above to add nodes!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================= MODAL 1: CATEGORY ORBIT POPUP DIALOG ======================= */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
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
                  <label className="block text-xs font-bold text-navy mb-1.5">Category Domain Name *</label>
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
                  <label className="block text-xs font-bold text-navy mb-1.5">Visual Icon Dropdown *</label>
                  <IconDropdownSelector
                    selectedIconName={form.icon}
                    onChange={(newIcon) => setForm({ ...form, icon: newIcon })}
                    color={form.color}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Domain Hex Color Theme</label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-navy outline-none focus:border-primaryBlue"
                  >
                    <option value="#126BEE">🔵 Royal Blue (#126BEE)</option>
                    <option value="#21A447">🟢 Medical Green (#21A447)</option>
                    <option value="#DB2674">PINK Magenta (#DB2674)</option>
                    <option value="#F17B18">🟠 Amber Orange (#F17B18)</option>
                    <option value="#13A7B5">CYAN Teal (#13A7B5)</option>
                    <option value="#7435D5">🟣 Deep Purple (#7435D5)</option>
                    <option value="#E11D48">🔴 Crimson Red (#E11D48)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Display Order #</label>
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
                <label className="block text-xs font-bold text-navy mb-1.5">Domain Description</label>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
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
                <label className="block text-xs font-bold text-navy mb-1.5">Subtopic Title *</label>
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
                  <label className="block text-xs font-bold text-navy mb-1.5">Visual Icon Dropdown *</label>
                  <IconDropdownSelector
                    selectedIconName={subForm.icon}
                    onChange={(newIcon) => setSubForm({ ...subForm, icon: newIcon })}
                    color={selectedParentCat.color}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Display Order #</label>
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
                <label className="block text-xs font-bold text-navy mb-1.5">Clinical Overview & Description</label>
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
    </div>
  );
};

export default ManageCategories;
