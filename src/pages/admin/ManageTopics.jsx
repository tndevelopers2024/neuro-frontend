import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Plus, Trash2, Edit, Save, AlertTriangle, ChevronRight, Brain, Network, Puzzle, CheckCircle2, Sparkles, Filter, RefreshCw, ChevronDown, Layers, X } from 'lucide-react';
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
        className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine flex items-center justify-between hover:border-primaryBlue transition-colors focus:outline-none"
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

const ManageTopics = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    parentTopic: '',
    level: 2, // Default to Tier 2 (Subtopic)
    icon: 'Brain',
    color: '#126BEE',
    displayOrder: 1,
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTierFilter, setActiveTierFilter] = useState('ALL');

  const queryClient = useQueryClient();

  // Fetch categories to bind topics
  const { data: catData } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/categories'),
    staleTime: 30 * 1000,
  });
  const categories = catData?.categories || [];

  // Fetch topics
  const { data: topData, isLoading } = useQuery({
    queryKey: ['adminTopicsTree'],
    queryFn: () => api.get('/topics?limit=500'),
    staleTime: 15 * 1000,
  });
  const topics = useMemo(() => topData?.topics || [], [topData]);

  // Set initial default category if form is empty
  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories]);

  // Filter topics by selected tier
  const filteredTopics = useMemo(() => {
    if (activeTierFilter === 'ALL') return topics;
    return topics.filter((t) => (t.level || 1) === Number(activeTierFilter));
  }, [topics, activeTierFilter]);

  // Mutator to add or update topics
  const saveTopic = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.parentTopic) delete payload.parentTopic;

      if (editingId) {
        await api.put(`/topics/${editingId}`, payload);
        toast.success('✅ Curriculum Node updated on student mind maps!');
      } else {
        await api.post('/topics', payload);
        toast.success('🎉 New Curriculum Node published across student views!');
      }

      // Force instant cache refresh of student and admin mind map structures
      queryClient.invalidateQueries();
      setIsModalOpen(false);
      setEditingId(null);
      setForm({
        title: '',
        category: categories[0]?._id || '',
        parentTopic: '',
        level: 2,
        icon: 'Brain',
        color: '#126BEE',
        displayOrder: topics.length + 1,
        description: '',
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save node.');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/topics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('🗑️ Node deleted from curriculum tree.');
    },
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`⚠️ CONFIRM DELETION:\nAre you sure you want to delete Node "${title}" and any child lessons attached to it?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: categories[0]?._id || '',
      parentTopic: '',
      level: 2,
      icon: 'Brain',
      color: '#126BEE',
      displayOrder: topics.length + 1,
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title,
      category: t.category?._id || t.category || (categories[0]?._id || ''),
      parentTopic: t.parentTopic?._id || t.parentTopic || '',
      level: t.level || 2,
      icon: t.icon || 'Brain',
      color: t.color || '#126BEE',
      displayOrder: t.displayOrder || 1,
      description: t.description || '',
    });
    setIsModalOpen(true);
  };

  // Auto Hydration of Default Medical Nodes for immediate testing
  const seedDefaults = async () => {
    try {
      const parentCat = categories[0] || (await api.post('/categories', { name: 'Core Psychiatry', description: 'Core domain' })).data.category;
      
      const sampleTopics = [
        { title: 'Child & Adolescent Psychiatry', level: 1, icon: 'Smile', color: '#126BEE', description: 'Developmental disorders and pediatric behavior.', category: parentCat._id },
        { title: 'Autism Spectrum Disorder (ASD)', level: 2, icon: 'Puzzle', color: '#7435D5', description: 'Social interaction deficits and repetitious behaviors.', category: parentCat._id },
        { title: 'ADHD Diagnostic Criteria', level: 2, icon: 'Activity', color: '#21A447', description: 'Inattentive and hyperactive presentations.', category: parentCat._id },
        { title: 'History of ASD Recognition', level: 3, icon: 'Clock', color: '#E11D48', description: 'Historical evolution of autism diagnostic nosology.', category: parentCat._id }
      ];

      for (const st of sampleTopics) {
        if (!topics.some(existing => existing.title === st.title)) {
          await api.post('/topics', st);
        }
      }
      queryClient.invalidateQueries();
      toast.success('⚡ Default Tiered Curriculum hydrated successfully!');
    } catch (err) {
      toast.error('Failed to hydrate defaults.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24 relative">
      {/* Header Banner */}
      <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-9 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primaryBlue/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#EAF9FB] text-cyan text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Compass className="w-3.5 h-3.5" /> Tiered Curriculum Hierarchy
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight">
            Manage Topics, Subtopics & Lessons
          </h1>
          <p className="text-sm font-medium text-muted mt-2 leading-relaxed">
            Organize learning modules across Tier 1 (Domain Branches), Tier 2 (Sub-disease Groups), and Tier 3 (Lesson Orbits). Create and update nodes via modal popups that sync instantly with student starburst views.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={seedDefaults}
            type="button"
            className="px-4 py-3.5 rounded-lg bg-[#EAF9FB] text-cyan font-bold text-xs flex items-center gap-2 hover:bg-[#D5F4F8] transition-all border border-cyan/20 shadow-xs"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>⚡ Hydrate Sample Nodes</span>
          </button>
          <button
            onClick={openCreateModal}
            className="btn-primary px-6 py-3.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-transform bg-primaryBlue"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create New Node</span>
          </button>
        </div>
      </div>

      {/* Interactive Hierarchy Table */}
      <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-borderLine pb-5">
          <div>
            <h3 className="text-base font-semibold text-navy flex items-center gap-2">
              <Network className="w-5 h-5 text-medicalGreen" />
              <span>Curriculum Hierarchy Table ({filteredTopics.length} Nodes)</span>
            </h3>
            <p className="text-xs text-muted font-medium mt-1">Filter by tier level to inspect branches, subtopics, and lesson modules.</p>
          </div>

          {/* Tier Filter Bar */}
          <div className="flex items-center gap-1.5 bg-secondaryBg p-1.5 rounded-lg border border-borderLine overflow-x-auto max-w-full">
            {[
              { id: 'ALL', label: 'All Tiers' },
              { id: 1, label: 'Tier 1: Branches' },
              { id: 2, label: 'Tier 2: Subtopics' },
              { id: 3, label: 'Tier 3: Lessons' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTierFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTierFilter === tab.id
                    ? 'bg-primaryBlue text-white shadow-sm'
                    : 'text-muted hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borderLine text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Topic / Subtopic Title</th>
                <th className="py-3.5 px-4">Tier Level</th>
                <th className="py-3.5 px-4">Parent Link</th>
                <th className="py-3.5 px-4">URL Slug</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
              {filteredTopics.map((t) => {
                const IconComp = Icons[t.icon || 'Brain'] || Icons.Brain;
                return (
                  <tr key={t._id} className="hover:bg-secondaryBg/70 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div style={{ backgroundColor: `${t.color || '#126BEE'}15`, color: t.color || '#126BEE' }} className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs border border-current/20">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-navy group-hover:text-primaryBlue transition-colors">{t.title}</div>
                          <div className="text-[11px] text-muted line-clamp-1">{t.description || 'Clinical diagnostics & study module.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                        t.level === 1 ? 'bg-[#E9F2FF] text-primaryBlue border border-primaryBlue/20' :
                        t.level === 2 ? 'bg-[#EAF7ED] text-medicalGreen border border-medicalGreen/20' :
                        'bg-[#FFF5ED] text-amber-600 border border-amber-500/20'
                      }`}>
                        {t.level === 1 && '⭐ Tier 1: Branch'}
                        {t.level === 2 && '🌿 Tier 2: Subtopic'}
                        {t.level === 3 && '🎯 Tier 3: Lesson'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {t.parentTopic ? (
                        <span className="font-bold text-navy bg-secondaryBg px-2.5 py-1 rounded-xl border border-borderLine inline-flex items-center gap-1">
                          ⬆ {t.parentTopic.title || 'Parent Node'}
                        </span>
                      ) : (
                        <span className="italic text-muted">Root Category</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-muted">{t.slug}</td>
                    <td className="py-4 px-4 font-bold text-navy">#{t.displayOrder || 1}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs hover:text-primaryBlue transition-all"
                          title="Edit Topic via Popup"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.title)}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-[#FFF2F2] text-muted font-bold text-xs border border-borderLine shadow-xs hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-all"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-sm text-muted font-bold">
                    No curriculum topics found for this tier filter. Click "Create New Node" above to start adding items!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= MODAL: TOPIC / SUBTOPIC POPUP DIALOG ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondaryBg text-muted hover:text-navy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6 border-b border-borderLine pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7ED] text-medicalGreen flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-navy">
                  {editingId ? 'Edit Curriculum Node' : 'Create New Curriculum Node'}
                </h3>
                <p className="text-xs text-muted font-medium">Configure tier classification, visual styling, and parent linkages.</p>
              </div>
            </div>

            <form onSubmit={saveTopic} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Topic or Subtopic Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Autism Spectrum Disorder"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Parent Category Orbit *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tier Selection Radio Tiles */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-navy mb-2">Curriculum Tier Classification *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { level: 1, name: 'Tier 1: Branch', desc: 'Primary subject specialty or domain branch', badge: 'bg-[#E9F2FF] text-primaryBlue border-primaryBlue/20' },
                    { level: 2, name: 'Tier 2: Subtopic', desc: 'Specific disease group or clinical pathology', badge: 'bg-[#EAF7ED] text-medicalGreen border-medicalGreen/20' },
                    { level: 3, name: 'Tier 3: Lesson Orbit', desc: 'Granular learning lesson (Etiology, Treatment)', badge: 'bg-[#FFF5ED] text-amber-600 border-amber-500/20' },
                  ].map((tier) => (
                    <div
                      key={tier.level}
                      onClick={() => setForm({ ...form, level: tier.level })}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        form.level === tier.level ? 'border-primaryBlue bg-[#E9F2FF]/30 shadow-xs' : 'border-borderLine hover:border-muted/30 bg-secondaryBg/40'
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase border ${tier.badge}`}>
                          {tier.name}
                        </span>
                        <p className="text-[11px] text-muted font-semibold mt-2.5 leading-tight">{tier.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Parent Topic Linkage (Optional)</label>
                  <select
                    value={form.parentTopic}
                    onChange={(e) => setForm({ ...form, parentTopic: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-xs text-navy outline-none focus:border-primaryBlue"
                  >
                    <option value="">-- None (Root Level Branch) --</option>
                    {topics.filter((pt) => pt._id !== editingId).map((pt) => (
                      <option key={pt._id} value={pt._id}>
                        [Tier {pt.level || 1}] {pt.title}
                      </option>
                    ))}
                  </select>
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
                  <label className="block text-xs font-bold text-navy mb-1.5">Theme Color Hex</label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-navy outline-none focus:border-primaryBlue"
                  >
                    <option value="#126BEE">🔵 Royal Blue (#126BEE)</option>
                    <option value="#21A447">🟢 Medical Green (#21A447)</option>
                    <option value="#DB2674">PINK Magenta (#DB2674)</option>
                    <option value="#F17B18">🟠 Amber Orange (#F17B18)</option>
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
                <label className="block text-xs font-bold text-navy mb-1.5">Clinical Description</label>
                <textarea
                  rows={2}
                  placeholder="Clinical evidence and study criteria..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue resize-none"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-borderLine">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-6 py-3.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-8 py-3.5 shadow-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Update Node & Sync Maps' : 'Publish Node to Curriculum'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTopics;
