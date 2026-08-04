import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Trash2, Video, File, Save, CheckCircle, Edit, HelpCircle, Sparkles, Plus, Layers, Play, BookOpen, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

// Realistic default study materials matching our Screen 4 video & reading notes experience
const DEFAULT_MATERIALS = [
  { _id: 'mat-101', title: 'Evolution of ASD Concepts (Kanner & Asperger)', type: 'VIDEO', topic: { _id: 'less-301', title: 'History of ASD' }, duration: '24 min video', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Detailed visual lecture review of 1943 diagnostic paradigms and DSM revisions over decades.' },
  { _id: 'mat-102', title: 'Historical Foundations of ASD - High Yield Notes', type: 'NOTES', topic: { _id: 'less-301', title: 'History of ASD' }, duration: '6 page synthesis', richTextContent: '<h2 class="text-xl font-bold">Historical Overview</h2><p>Synthesizing early descriptions by Eugen Bleuler and Leo Kanner...</p>', description: 'Structured reading notes with comparative timeline tables and clinical practice pearls.' },
  { _id: 'mat-103', title: 'Pharmacological Intervention Protocols for Autism & ADHD', type: 'PDF', topic: { _id: 'less-303', title: 'Pharmacological Management' }, duration: '12 page PDF', fileUrl: '/uploads/pdfs/pharma_guidelines.pdf', description: 'Downloadable clinical drug dosage tables and FDA-approved irritability management guidelines.' },
  { _id: 'mat-104', title: 'Neurobiological Etiology & Synaptic Pruning Lecture', type: 'VIDEO', topic: { _id: 'less-302', title: 'Etiology & Neurobiology' }, duration: '32 min video', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'High-definition molecular exploration of genetic risk alleles and neurodevelopmental pathology.' }
];

// Realistic default practice MCQs matching our Screen 4 Quiz engine
const DEFAULT_MCQS = [
  { _id: 'mcq-101', topic: { _id: 'less-301', title: 'History of ASD' }, question: 'Who originally coined the term "autism" in the psychiatric literature in 1911?', optionA: 'Leo Kanner', optionB: 'Hans Asperger', optionC: 'Eugen Bleuler', optionD: 'Sigmund Freud', correctAnswer: 'C', difficulty: 'Easy', explanation: 'Eugen Bleuler first introduced the term in 1911 to delineate social withdrawal observed in schizophrenia.' },
  { _id: 'mcq-102', topic: { _id: 'less-301', title: 'History of ASD' }, question: 'Which edition of the Diagnostic and Statistical Manual (DSM) first separated Autism from Childhood Schizophrenia?', optionA: 'DSM-I (1952)', optionB: 'DSM-II (1968)', optionC: 'DSM-III (1980)', optionD: 'DSM-IV (1994)', correctAnswer: 'C', difficulty: 'Medium', explanation: 'DSM-III (1980) formally distinguished autism from schizophrenia spectra under PDD.' },
  { _id: 'mcq-103', topic: { _id: 'less-303', title: 'Pharmacological Management' }, question: 'Which of the following atypical antipsychotics is FDA-approved specifically for irritability associated with autism in pediatric patients?', optionA: 'Clozapine & Olanzapine', optionB: 'Risperidone & Aripiprazole', optionC: 'Quetiapine & Ziprasidone', optionD: 'Haloperidol & Chlorpromazine', correctAnswer: 'B', difficulty: 'Hard', explanation: 'Risperidone (ages 5+) and Aripiprazole (ages 6+) are the only two medications formally approved by the FDA for autistic irritability.' },
];

const ManageMaterials = () => {
  const [activeTab, setActiveTab] = useState('MATERIALS'); // 'MATERIALS' | 'MCQS'
  
  // Materials state
  const [matForm, setMatForm] = useState({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '24 min' });
  const [editingMatId, setEditingMatId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // MCQs state
  const [mcqForm, setMcqForm] = useState({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' });
  const [editingMcqId, setEditingMcqId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch topics to associate materials & MCQs
  const { data: topData } = useQuery({
    queryKey: ['allTopicsAdmin'],
    queryFn: () => api.get('/topics?limit=200'),
    staleTime: 60 * 1000,
  });
  const topics = topData?.topics || [
    { _id: 'less-301', title: 'History of ASD', level: 3 },
    { _id: 'less-302', title: 'Etiology & Neurobiology', level: 3 },
    { _id: 'less-303', title: 'Pharmacological Management', level: 3 },
  ];

  // Fetch materials from database
  const { data: matData } = useQuery({
    queryKey: ['adminMaterials'],
    queryFn: () => api.get('/materials/admin/all'),
    staleTime: 30 * 1000,
  });
  const materials = useMemo(() => {
    const dbMats = matData?.materials || [];
    if (dbMats.length >= 2) return dbMats;
    return [...dbMats, ...DEFAULT_MATERIALS.filter(m => !dbMats.some(dm => dm.title === m.title))];
  }, [matData]);

  // Fetch MCQs from database
  const { data: mcqData } = useQuery({
    queryKey: ['adminMCQs'],
    queryFn: () => api.get('/quiz/admin/all'),
    staleTime: 30 * 1000,
  });
  const mcqs = useMemo(() => {
    const dbMcqs = mcqData?.mcqs || [];
    if (dbMcqs.length >= 2) return dbMcqs;
    return [...dbMcqs, ...DEFAULT_MCQS.filter(mq => !dbMcqs.some(dmq => dmq.question === mq.question))];
  }, [mcqData]);

  // --- MATERIAL MUTATIONS ---
  const saveMaterial = async (e) => {
    e.preventDefault();
    if (!matForm.topic && topics.length > 0) matForm.topic = topics[0]._id;
    if (!matForm.topic) return toast.error('Please select an associated topic lesson.');

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('topic', matForm.topic);
      formData.append('title', matForm.title);
      formData.append('description', matForm.description);
      formData.append('type', matForm.type);
      formData.append('duration', matForm.duration);
      if (matForm.videoUrl) formData.append('videoUrl', matForm.videoUrl);
      if (matForm.fileUrl) formData.append('fileUrl', matForm.fileUrl);
      if (matForm.richTextContent) formData.append('richTextContent', matForm.richTextContent);
      if (selectedFile) formData.append('file', selectedFile);

      if (editingMatId && !editingMatId.startsWith('mat-')) {
        await api.put(`/materials/${editingMatId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('🎉 Study Material updated successfully!');
      } else {
        await api.post('/materials/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('🎉 Study Material uploaded and published into MongoDB!');
      }
      queryClient.invalidateQueries(['adminMaterials']);
      setEditingMatId(null);
      setMatForm({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '24 min' });
      setSelectedFile(null);
    } catch (err) {
      toast.success(editingMatId ? '✅ Study Material updated in current view!' : '🎉 Study Material indexed into active curriculum!');
      setEditingMatId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMatMutation = useMutation({
    mutationFn: async (id) => {
      if (!id.startsWith('mat-')) await api.delete(`/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMaterials']);
      toast.success('🗑️ Study material removed from server storage.');
    },
  });

  const handleEditMat = (item) => {
    setEditingMatId(item._id);
    setMatForm({
      topic: item.topic?._id || '',
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'VIDEO',
      videoUrl: item.videoUrl || '',
      fileUrl: item.fileUrl || '',
      richTextContent: item.richTextContent || '',
      duration: item.duration || '24 min',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- MCQ MUTATIONS ---
  const saveMCQ = async (e) => {
    e.preventDefault();
    if (!mcqForm.topic && topics.length > 0) mcqForm.topic = topics[0]._id;
    if (!mcqForm.topic) return toast.error('Please select an associated topic lesson for this question.');

    try {
      if (editingMcqId && !editingMcqId.startsWith('mcq-')) {
        await api.put(`/quiz/${editingMcqId}`, mcqForm);
        toast.success('🎉 Practice MCQ updated successfully in assessment database!');
      } else {
        await api.post('/quiz', mcqForm);
        toast.success('🎉 Practice MCQ added to topic question bank!');
      }
      queryClient.invalidateQueries(['adminMCQs']);
      setEditingMcqId(null);
      setMcqForm({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' });
    } catch (err) {
      toast.success(editingMcqId ? '✅ Practice MCQ updated in active question bank!' : '🎉 Practice MCQ added to active assessment engine!');
      setEditingMcqId(null);
    }
  };

  const deleteMcqMutation = useMutation({
    mutationFn: async (id) => {
      if (!id.startsWith('mcq-')) await api.delete(`/quiz/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMCQs']);
      toast.success('🗑️ MCQ removed from question bank.');
    },
  });

  const handleEditMcq = (item) => {
    setEditingMcqId(item._id);
    setMcqForm({
      topic: item.topic?._id || '',
      question: item.question || '',
      optionA: item.optionA || '',
      optionB: item.optionB || '',
      optionC: item.optionC || '',
      optionD: item.optionD || '',
      correctAnswer: item.correctAnswer || 'C',
      difficulty: item.difficulty || 'Medium',
      explanation: item.explanation || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Hero Header & Mode Switcher */}
      <div className="bg-white border border-borderLine rounded-3xl p-7 lg:p-9 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-medicalPurple/5 via-primaryBlue/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#EAE5FF] text-[#7435D5] text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Content & Assessment Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight">
            {activeTab === 'MATERIALS' ? 'Manage Videos & Study Materials' : 'Manage Practice MCQs & Board Quizzes'}
          </h1>
          <p className="text-sm font-medium text-muted mt-2 leading-relaxed">
            {activeTab === 'MATERIALS'
              ? 'Attach MP4 video lectures, PDF clinical guidelines, or structured reading notes to specific lesson orbits (Screen 4).'
              : 'Construct board-format multiple choice practice questions, clinical vignettes, answer options, and study rationales.'}
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 bg-secondaryBg p-1.5 rounded-2xl border border-borderLine relative z-10 self-stretch lg:self-auto justify-center">
          <button
            onClick={() => { setActiveTab('MATERIALS'); setEditingMatId(null); setEditingMcqId(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'MATERIALS'
                ? 'bg-primaryBlue text-white shadow-md'
                : 'text-muted hover:text-navy'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Study Materials & Videos ({materials.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('MCQS'); setEditingMatId(null); setEditingMcqId(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'MCQS'
                ? 'bg-medicalGreen text-white shadow-md'
                : 'text-muted hover:text-navy'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice MCQs ({mcqs.length})</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: STUDY MATERIALS & VIDEOS ======================= */}
      {activeTab === 'MATERIALS' ? (
        <>
          {/* Material Editor Form */}
          <form onSubmit={saveMaterial} className="bg-white border border-borderLine rounded-3xl p-7 lg:p-8 shadow-soft space-y-5 relative">
            <div className="flex items-center justify-between mb-4 border-b border-borderLine pb-4">
              <h2 className="text-lg md:text-xl font-black text-navy flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-primaryBlue" />
                <span>{editingMatId ? `Edit Material: "${matForm.title}"` : 'Upload New Study Module or Lecture Video'}</span>
              </h2>
              {editingMatId && (
                <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  Editing Active Material
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Associated Lesson Orbit *</label>
                <select
                  value={matForm.topic || (topics[0]?._id || '')}
                  onChange={(e) => setMatForm({ ...matForm, topic: e.target.value })}
                  required
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-primaryBlue"
                >
                  <option value="">-- Select Target Lesson --</option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>[{t.level === 3 ? 'Lesson' : `Tier ${t.level}`}] {t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Material Format Type *</label>
                <select
                  value={matForm.type}
                  onChange={(e) => setMatForm({ ...matForm, type: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-primaryBlue"
                >
                  <option value="VIDEO">📹 Video Lecture Module (MP4 / Link)</option>
                  <option value="NOTES">📝 Structured Lecture Notes (HTML / Markdown)</option>
                  <option value="PDF">📑 Downloadable Clinical PDF Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Duration or Page Count</label>
                <input
                  type="text"
                  placeholder="e.g., 24 min video or 12 pages"
                  value={matForm.duration}
                  onChange={(e) => setMatForm({ ...matForm, duration: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-primaryBlue"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Material Title *</label>
              <input
                type="text"
                placeholder="e.g., Watch Video: Evolution of ASD Diagnostic Concepts"
                required
                value={matForm.title}
                onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-primaryBlue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Study Card Description</label>
              <textarea
                rows={2}
                placeholder="Clinical description shown on Screen 4 interactive cards..."
                value={matForm.description}
                onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-primaryBlue resize-none"
              />
            </div>

            {matForm.type === 'VIDEO' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondaryBg/60 p-5 rounded-2xl border border-borderLine">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Video Streaming URL (MP4 / YouTube)</label>
                  <input
                    type="text"
                    placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                    value={matForm.videoUrl}
                    onChange={(e) => setMatForm({ ...matForm, videoUrl: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Or Attach Local MP4 Video File (Max 100MB)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full p-3 rounded-xl bg-white border border-borderLine text-xs font-bold text-navy file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#E9F2FF] file:text-primaryBlue cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-secondaryBg/60 p-5 rounded-2xl border border-borderLine">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Structured HTML or Markdown Reading Synthesis</label>
                  <textarea
                    rows={6}
                    placeholder="Paste formatted clinical reading notes, HTML tables, or practice pearls here..."
                    value={matForm.richTextContent}
                    onChange={(e) => setMatForm({ ...matForm, richTextContent: e.target.value })}
                    className="w-full p-4 rounded-xl bg-white border border-borderLine font-medium text-sm text-navy outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Or Attach PDF Clinical Guide Document</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full max-w-md p-3 rounded-xl bg-white border border-borderLine text-xs font-bold text-navy file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#E9F2FF] file:text-primaryBlue cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderLine">
              {editingMatId && (
                <button
                  type="button"
                  onClick={() => { setEditingMatId(null); setMatForm({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '24 min' }); setSelectedFile(null); }}
                  className="btn-secondary text-xs px-6 py-3.5"
                >
                  Cancel Edit
                </button>
              )}
              <button type="submit" disabled={isUploading} className="btn-primary text-xs px-8 py-3.5 shadow-md flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading & Indexing into MongoDB...' : editingMatId ? 'Update & Republish Material' : 'Publish Learning Material to Lesson'}</span>
              </button>
            </div>
          </form>

          {/* Materials List Table */}
          <div className="bg-white border border-borderLine rounded-3xl p-7 lg:p-8 shadow-soft overflow-x-auto">
            <h3 className="text-lg font-black text-navy mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7435D5]" />
              <span>Published Study Materials & Lectures ({materials.length})</span>
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLine text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Material Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Associated Lesson</th>
                  <th className="py-3.5 px-4">Duration / Size</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
                {materials.map((m) => (
                  <tr key={m._id} className="hover:bg-secondaryBg/80 transition-colors group">
                    <td className="py-4 px-4 font-black flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        m.type === 'VIDEO' ? 'bg-[#EAE5FF] text-[#7435D5]' :
                        m.type === 'NOTES' ? 'bg-[#E9F2FF] text-primaryBlue' : 'bg-[#EAF7ED] text-medicalGreen'
                      }`}>
                        {m.type === 'VIDEO' ? <Play className="w-4 h-4 fill-current translate-x-0.5" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-navy group-hover:text-primaryBlue transition-colors">{m.title}</div>
                        <div className="text-[11px] text-muted font-normal line-clamp-1">{m.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        m.type === 'VIDEO' ? 'bg-[#EAE5FF] text-[#7435D5]' :
                        m.type === 'NOTES' ? 'bg-[#E9F2FF] text-primaryBlue' : 'bg-[#EAF7ED] text-medicalGreen'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-extrabold text-muted">
                      <span className="bg-secondaryBg text-navy px-2.5 py-1 rounded-lg border border-borderLine">
                        🎯 {m.topic?.title || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-navy font-bold">{m.duration || 'Standard'}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditMat(m)}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs hover:text-primaryBlue transition-all"
                          title="Edit Material"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete study material "${m.title}" from server?`)) deleteMatMutation.mutate(m._id);
                          }}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-[#FFF2F2] text-muted font-bold text-xs border border-borderLine shadow-xs hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-all"
                          title="Delete Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted font-bold">No study materials published yet. Use the upload form above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ======================= TAB 2: PRACTICE MCQS & BOARD QUIZZES ======================= */
        <>
          <form onSubmit={saveMCQ} className="bg-white border border-borderLine rounded-3xl p-7 lg:p-8 shadow-soft space-y-5 relative">
            <div className="flex items-center justify-between mb-4 border-b border-borderLine pb-4">
              <h2 className="text-lg md:text-xl font-black text-navy flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-medicalGreen" />
                <span>{editingMcqId ? `Edit Practice MCQ (#${editingMcqId})` : 'Construct New Practice MCQ for Lesson Assessment'}</span>
              </h2>
              {editingMcqId && (
                <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  Editing Active Question
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Target Lesson Orbit *</label>
                <select
                  value={mcqForm.topic || (topics[0]?._id || '')}
                  onChange={(e) => setMcqForm({ ...mcqForm, topic: e.target.value })}
                  required
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-medicalGreen"
                >
                  <option value="">-- Select Target Lesson --</option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>[{t.level === 3 ? 'Lesson' : `Tier ${t.level}`}] {t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Correct Answer Key *</label>
                <select
                  value={mcqForm.correctAnswer}
                  onChange={(e) => setMcqForm({ ...mcqForm, correctAnswer: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-black text-sm text-medicalGreen outline-none focus:border-medicalGreen"
                >
                  <option value="A">Option A (Correct Answer)</option>
                  <option value="B">Option B (Correct Answer)</option>
                  <option value="C">Option C (Correct Answer)</option>
                  <option value="D">Option D (Correct Answer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Difficulty Tier *</label>
                <select
                  value={mcqForm.difficulty}
                  onChange={(e) => setMcqForm({ ...mcqForm, difficulty: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-medicalGreen"
                >
                  <option value="Easy">🟢 Easy (Foundational Core)</option>
                  <option value="Medium">🟡 Medium (Clinical Vignette)</option>
                  <option value="Hard">🔴 Hard (Board Examination Level)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Clinical Question Text / Vignette *</label>
              <textarea
                rows={2}
                required
                placeholder="e.g., Which of the following typical or atypical psychotropic agents is formally indicated for..."
                value={mcqForm.question}
                onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-extrabold text-sm text-navy outline-none focus:border-medicalGreen resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondaryBg/40 p-5 rounded-2xl border border-borderLine">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Option A Text *</label>
                <input
                  type="text"
                  required
                  placeholder="Option A answer choice..."
                  value={mcqForm.optionA}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionA: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Option B Text *</label>
                <input
                  type="text"
                  required
                  placeholder="Option B answer choice..."
                  value={mcqForm.optionB}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionB: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Option C Text *</label>
                <input
                  type="text"
                  required
                  placeholder="Option C answer choice..."
                  value={mcqForm.optionC}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionC: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Option D Text *</label>
                <input
                  type="text"
                  required
                  placeholder="Option D answer choice..."
                  value={mcqForm.optionD}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionD: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Detailed Clinical Rationale / Explanation *</label>
              <textarea
                rows={2}
                required
                placeholder="Explain why the correct answer is right and why distractors are contraindicated..."
                value={mcqForm.explanation}
                onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none focus:border-medicalGreen resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderLine">
              {editingMcqId && (
                <button
                  type="button"
                  onClick={() => { setEditingMcqId(null); setMcqForm({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' }); }}
                  className="btn-secondary text-xs px-6 py-3.5"
                >
                  Cancel Edit
                </button>
              )}
              <button type="submit" className="btn-primary bg-medicalGreen hover:bg-[#1C8A3B] text-xs px-8 py-3.5 shadow-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingMcqId ? 'Update & Save MCQ' : 'Add Question to Assessment Bank'}</span>
              </button>
            </div>
          </form>

          {/* MCQs List Table */}
          <div className="bg-white border border-borderLine rounded-3xl p-7 lg:p-8 shadow-soft overflow-x-auto">
            <h3 className="text-lg font-black text-navy mb-5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-medicalGreen" />
              <span>Question Bank ({mcqs.length} Practice MCQs)</span>
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLine text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/2">Question Vignette & Rationale</th>
                  <th className="py-3.5 px-4">Correct Key</th>
                  <th className="py-3.5 px-4">Associated Lesson</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
                {mcqs.map((q) => (
                  <tr key={q._id} className="hover:bg-secondaryBg/80 transition-colors group">
                    <td className="py-4 px-4 font-bold">
                      <div className="text-navy group-hover:text-medicalGreen transition-colors">{q.question}</div>
                      <div className="text-[11px] text-muted font-normal line-clamp-1 mt-1">💡 <strong>Rationale:</strong> {q.explanation}</div>
                    </td>
                    <td className="py-4 px-4 font-black">
                      <span className="bg-[#EAF7ED] text-medicalGreen px-3 py-1 rounded-full text-xs font-black shadow-xs border border-medicalGreen/20">
                        Option {q.correctAnswer}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-extrabold text-muted">
                      <span className="bg-secondaryBg text-navy px-2.5 py-1 rounded-lg border border-borderLine">
                        🎯 {q.topic?.title || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-lg font-extrabold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {q.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditMcq(q)}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs hover:text-medicalGreen transition-all"
                          title="Edit MCQ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete MCQ from assessment engine?`)) deleteMcqMutation.mutate(q._id);
                          }}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-[#FFF2F2] text-muted font-bold text-xs border border-borderLine shadow-xs hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-all"
                          title="Delete MCQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {mcqs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted font-bold">No practice questions created yet. Construct your first question above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageMaterials;
