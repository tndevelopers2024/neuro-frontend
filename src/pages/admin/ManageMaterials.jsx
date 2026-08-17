import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Trash2, Video, File, Save, CheckCircle, Edit, HelpCircle, Sparkles, Plus, Layers, Play, BookOpen, CheckCircle2, Search, Filter, X, Table, PlusCircle, RotateCcw, Eye, MessageCircle } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl.replace('/api', '')}${url}`;
  }
  return url;
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const ManageMaterials = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab directly from URL pathname set by sidebar navigation
  const activeTab = location.pathname.includes('/materials/upload') ? 'UPLOAD_MATERIALS' :
                    location.pathname.includes('/materials/table') ? 'TABLE_MATERIALS' :
                    location.pathname.includes('/mcqs/create') ? 'UPLOAD_MCQS' :
                    location.pathname.includes('/mcqs/table') ? 'TABLE_MCQS' :
                    location.pathname.includes('/mcqs') ? 'TABLE_MCQS' : 'TABLE_MATERIALS';
  
  // Materials state
  const [matForm, setMatForm] = useState({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '' });
  const [editingMatId, setEditingMatId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMatSubject, setSelectedMatSubject] = useState('');
  const [selectedMatCategory, setSelectedMatCategory] = useState('');
  const [selectedMatSubtopic, setSelectedMatSubtopic] = useState('');
  const [selectedMatSubSubtopic, setSelectedMatSubSubtopic] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [matTypeTab, setMatTypeTab] = useState('ALL');
  const [viewingCommentsForMaterial, setViewingCommentsForMaterial] = useState(null);

  // MCQs state
  const [mcqForm, setMcqForm] = useState({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' });
  const [editingMcqId, setEditingMcqId] = useState(null);
  const [selectedMcqSubject, setSelectedMcqSubject] = useState('');
  const [selectedMcqCategory, setSelectedMcqCategory] = useState('');
  const [selectedMcqSubtopic, setSelectedMcqSubtopic] = useState('');
  const [selectedMcqSubSubtopic, setSelectedMcqSubSubtopic] = useState('');

  const queryClient = useQueryClient();

  // 1. Fetch Subjects
  const { data: subData } = useQuery({
    queryKey: ['allSubjectsAdmin'],
    queryFn: () => api.get('/subjects'),
    staleTime: 60 * 1000,
  });
  const subjects = useMemo(() => subData?.subjects || [], [subData]);

  // 2. Fetch Categories (Domain Topics under Subjects)
  const { data: catData } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/categories'),
    staleTime: 30 * 1000,
  });
  const categories = useMemo(() => catData?.categories || [], [catData]);

  // 3. Fetch Subtopics to attach study materials & MCQs
  const { data: topData } = useQuery({
    queryKey: ['allTopicsAdmin'],
    queryFn: () => api.get('/topics?limit=200'),
    staleTime: 20 * 1000,
  });
  const topics = useMemo(() => topData?.topics || [], [topData]);

  // Filter topics and subtopics for Material Form
  const matAvailableTopics = useMemo(() => {
    if (!selectedMatSubject) return categories;
    return categories.filter(c => c.subject && (c.subject._id === selectedMatSubject || c.subject === selectedMatSubject));
  }, [categories, selectedMatSubject]);

  const matAvailableSubtopics = useMemo(() => {
    if (!selectedMatCategory) return [];
    return topics.filter(t => t.category && (t.category._id === selectedMatCategory || t.category === selectedMatCategory) && !t.parentTopic);
  }, [topics, selectedMatCategory]);

  const matAvailableSubSubtopics = useMemo(() => {
    if (!selectedMatSubtopic) return [];
    return topics.filter(t => {
      const pId = t.parentTopic?._id || t.parentTopic;
      return pId && pId.toString() === selectedMatSubtopic.toString();
    });
  }, [topics, selectedMatSubtopic]);

  // Filter topics and subtopics for MCQ Form
  const mcqAvailableTopics = useMemo(() => {
    if (!selectedMcqSubject) return categories;
    return categories.filter(c => c.subject && (c.subject._id === selectedMcqSubject || c.subject === selectedMcqSubject));
  }, [categories, selectedMcqSubject]);

  const mcqAvailableSubtopics = useMemo(() => {
    if (!selectedMcqCategory) return [];
    return topics.filter(t => t.category && (t.category._id === selectedMcqCategory || t.category === selectedMcqCategory) && !t.parentTopic);
  }, [topics, selectedMcqCategory]);

  const mcqAvailableSubSubtopics = useMemo(() => {
    if (!selectedMcqSubtopic) return [];
    return topics.filter(t => {
      const pId = t.parentTopic?._id || t.parentTopic;
      return pId && pId.toString() === selectedMcqSubtopic.toString();
    });
  }, [topics, selectedMcqSubtopic]);

  // Fetch materials from database
  const { data: matData } = useQuery({
    queryKey: ['adminMaterials'],
    queryFn: () => api.get('/materials/admin/all'),
    staleTime: 30 * 1000,
  });
  const materials = useMemo(() => matData?.materials || [], [matData]);

  // Fetch MCQs from database
  const { data: mcqData } = useQuery({
    queryKey: ['adminMCQs'],
    queryFn: () => api.get('/quiz/admin/all'),
    staleTime: 30 * 1000,
  });
  const mcqs = useMemo(() => mcqData?.mcqs || [], [mcqData]);

  const { data: commentsData } = useQuery({
    queryKey: ['materialComments', viewingCommentsForMaterial?._id],
    queryFn: () => api.get(`/comments/material/${viewingCommentsForMaterial._id}`),
    enabled: !!viewingCommentsForMaterial,
  });
  const materialComments = useMemo(() => commentsData?.data || [], [commentsData]);

  // Populate form when navigating to edit from the library tables via router state
  useEffect(() => {
    if (location.state?.editMatItem && topics.length > 0 && categories.length > 0) {
      const item = location.state.editMatItem;
      setEditingMatId(item._id);
      const subId = item.topic?._id || item.topic || '';
      setMatForm({
        topic: subId,
        title: item.title || '',
        description: item.description || '',
        type: item.type || 'VIDEO',
        videoUrl: item.videoUrl || '',
        fileUrl: item.fileUrl || '',
        richTextContent: item.richTextContent || '',
        duration: item.duration || '',
      });
      const matchedSub = topics.find(t => (t._id || t)?.toString() === subId?.toString());
      if (matchedSub) {
        if (matchedSub.parentTopic) {
          const parentId = matchedSub.parentTopic?._id || matchedSub.parentTopic;
          setSelectedMatSubtopic(parentId?.toString() || '');
          setSelectedMatSubSubtopic(matchedSub._id);
        } else {
          setSelectedMatSubtopic(matchedSub._id);
          setSelectedMatSubSubtopic('');
        }
        const catId = matchedSub.category?._id || matchedSub.category || '';
        setSelectedMatCategory(catId);
        const matchedCat = categories.find(c => (c._id || c)?.toString() === catId?.toString());
        if (matchedCat) {
          setSelectedMatSubject(matchedCat.subject?._id || matchedCat.subject || '');
        }
      }
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.editMcqItem && topics.length > 0 && categories.length > 0) {
      const item = location.state.editMcqItem;
      setEditingMcqId(item._id);
      const subId = item.topic?._id || item.topic || '';
      setMcqForm({
        topic: subId,
        question: item.question || '',
        optionA: item.optionA || '',
        optionB: item.optionB || '',
        optionC: item.optionC || '',
        optionD: item.optionD || '',
        correctAnswer: item.correctAnswer || 'C',
        difficulty: item.difficulty || 'Medium',
        explanation: item.explanation || '',
      });
      const matchedSub = topics.find(t => (t._id || t)?.toString() === subId?.toString());
      if (matchedSub) {
        if (matchedSub.parentTopic) {
          const parentId = matchedSub.parentTopic?._id || matchedSub.parentTopic;
          setSelectedMcqSubtopic(parentId?.toString() || '');
          setSelectedMcqSubSubtopic(matchedSub._id);
        } else {
          setSelectedMcqSubtopic(matchedSub._id);
          setSelectedMcqSubSubtopic('');
        }
        const catId = matchedSub.category?._id || matchedSub.category || '';
        setSelectedMcqCategory(catId);
        const matchedCat = categories.find(c => (c._id || c)?.toString() === catId?.toString());
        if (matchedCat) {
          setSelectedMcqSubject(matchedCat.subject?._id || matchedCat.subject || '');
        }
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, topics, categories, navigate, location.pathname]);

  // Reset editing state when switching route tabs directly in sidebar
  useEffect(() => {
    if (!location.state?.editMatItem && activeTab !== 'UPLOAD_MATERIALS' && editingMatId) {
      setEditingMatId(null);
      setMatForm({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '' });
      setSelectedFile(null);
    }
    if (!location.state?.editMcqItem && activeTab !== 'UPLOAD_MCQS' && editingMcqId) {
      setEditingMcqId(null);
      setMcqForm({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' });
    }
  }, [activeTab, location.state, editingMatId, editingMcqId]);

  // Table Filtering & Search States
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterSubtopic, setFilterSubtopic] = useState('');
  const [filterSubSubtopic, setFilterSubSubtopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter dropdown options for tables
  const filterAvailableTopics = useMemo(() => {
    if (!filterSubject) return categories;
    return categories.filter(c => c.subject && (c.subject._id === filterSubject || c.subject === filterSubject));
  }, [categories, filterSubject]);

  const filterAvailableSubtopics = useMemo(() => {
    if (!filterTopic) return topics.filter(t => !t.parentTopic);
    return topics.filter(t => t.category && (t.category._id === filterTopic || t.category === filterTopic) && !t.parentTopic);
  }, [topics, filterTopic]);

  const filterAvailableSubSubtopics = useMemo(() => {
    if (!filterSubtopic) return topics.filter(t => t.parentTopic);
    return topics.filter(t => {
      const pId = t.parentTopic?._id || t.parentTopic;
      return pId && pId.toString() === filterSubtopic.toString();
    });
  }, [topics, filterSubtopic]);

  // Helper function to check if an item matches the current filters and search query
  const checkItemMatch = (itemTopicId, title = '', description = '', extraText = '') => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        (title && title.toLowerCase().includes(q)) ||
        (description && description.toLowerCase().includes(q)) ||
        (extraText && extraText.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    if (!filterSubject && !filterTopic && !filterSubtopic && !filterSubSubtopic) {
      return true;
    }

    if (!itemTopicId) return false;

    const tId = (itemTopicId._id || itemTopicId)?.toString();
    const tObj = topics.find(t => (t._id || t)?.toString() === tId);
    if (!tObj) return false;

    let itemSubSubId = null;
    let itemSubId = null;
    if (tObj.parentTopic) {
      itemSubSubId = tObj._id?.toString();
      itemSubId = (tObj.parentTopic._id || tObj.parentTopic)?.toString();
    } else {
      itemSubId = tObj._id?.toString();
    }
    const itemCatId = (tObj.category?._id || tObj.category)?.toString();
    const catObj = categories.find(c => (c._id || c)?.toString() === itemCatId);
    const itemSubjId = (catObj?.subject?._id || catObj?.subject)?.toString();

    if (filterSubject && itemSubjId !== filterSubject.toString()) return false;
    if (filterTopic && itemCatId !== filterTopic.toString()) return false;
    if (filterSubtopic && itemSubId !== filterSubtopic.toString()) return false;
    if (filterSubSubtopic && itemSubSubId !== filterSubSubtopic.toString()) return false;

    return true;
  };

  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter(m => checkItemMatch(m.topic, m.title, m.description, m.type || m.topic?.title));
    
    if (matTypeTab === 'VIDEO') {
      filtered = filtered.filter(m => m.type === 'VIDEO');
    } else if (matTypeTab === 'DOC') {
      filtered = filtered.filter(m => m.type === 'NOTES' || m.type === 'PDF');
    }
    
    return filtered;
  }, [materials, filterSubject, filterTopic, filterSubtopic, filterSubSubtopic, searchQuery, topics, categories, matTypeTab]);

  const filteredMCQs = useMemo(() => {
    return mcqs.filter(q => checkItemMatch(q.topic, q.question, q.explanation, q.topic?.title));
  }, [mcqs, filterSubject, filterTopic, filterSubtopic, filterSubSubtopic, searchQuery, topics, categories]);

  const renderFilterDashboard = (colorClass = 'text-primaryBlue', borderClass = 'focus:border-primaryBlue', isMcq = false) => (
    <div className="bg-white border border-borderLine rounded-xl p-6 lg:p-7 shadow-soft space-y-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderLine pb-4">
        <div className="flex items-center gap-2 font-bold text-navy text-base">
          <Filter className={`w-5 h-5 ${colorClass}`} />
          <span>Filter {isMcq ? 'Question Bank' : 'Study Materials'} & Advanced Search</span>
          {(filterSubject || filterTopic || filterSubtopic || filterSubSubtopic || searchQuery) && (
            <span className={isMcq ? 'bg-[#EAF7ED] text-medicalGreen text-xs font-semibold px-3 py-0.5 rounded-full' : 'bg-[#E9F2FF] text-primaryBlue text-xs font-semibold px-3 py-0.5 rounded-full'}>
              Filters Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isMcq ? "Search vignette, rationale, or lesson..." : "Search title, lesson, or keywords..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-9 py-2 rounded-xl bg-secondaryBg border border-borderLine text-xs font-bold text-navy outline-none ${borderClass} transition-all`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {(filterSubject || filterTopic || filterSubtopic || filterSubSubtopic || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterSubject('');
                setFilterTopic('');
                setFilterSubtopic('');
                setFilterSubSubtopic('');
                setSearchQuery('');
              }}
              className="px-3.5 py-2 rounded-xl bg-secondaryBg hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] border border-borderLine text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Filter by Subject</label>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilterTopic('');
              setFilterSubtopic('');
              setFilterSubSubtopic('');
            }}
            className={`w-full p-3 rounded-xl bg-white border border-borderLine font-bold text-xs text-navy outline-none ${borderClass} shadow-xs`}
          >
            <option value="">All Subjects ({subjects.length})</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Filter by Topic</label>
          <select
            value={filterTopic}
            onChange={(e) => {
              setFilterTopic(e.target.value);
              setFilterSubtopic('');
              setFilterSubSubtopic('');
            }}
            disabled={!filterSubject && filterAvailableTopics.length === 0}
            className={`w-full p-3 rounded-xl bg-white border border-borderLine font-bold text-xs text-navy outline-none ${borderClass} shadow-xs disabled:opacity-50`}
          >
            <option value="">All Topics ({filterAvailableTopics.length})</option>
            {filterAvailableTopics.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Filter by Subtopic</label>
          <select
            value={filterSubtopic}
            onChange={(e) => {
              setFilterSubtopic(e.target.value);
              setFilterSubSubtopic('');
            }}
            disabled={!filterTopic && filterAvailableSubtopics.length === 0}
            className={`w-full p-3 rounded-xl bg-white border border-borderLine font-bold text-xs text-navy outline-none ${borderClass} shadow-xs disabled:opacity-50`}
          >
            <option value="">All Subtopics ({filterAvailableSubtopics.length})</option>
            {filterAvailableSubtopics.map(st => (
              <option key={st._id} value={st._id}>{st.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Filter by Subtopic's Subtopic</label>
          <select
            value={filterSubSubtopic}
            onChange={(e) => setFilterSubSubtopic(e.target.value)}
            disabled={!filterSubtopic || filterAvailableSubSubtopics.length === 0}
            className={`w-full p-3 rounded-xl bg-white border border-borderLine font-bold text-xs text-navy outline-none ${borderClass} shadow-xs disabled:opacity-50`}
          >
            <option value="">
              {!filterSubtopic ? 'Select Subtopic first...' : filterAvailableSubSubtopics.length === 0 ? 'No Sub-Subtopics Available' : `All Sub-Subtopics (${filterAvailableSubSubtopics.length})`}
            </option>
            {filterAvailableSubSubtopics.map(sst => (
              <option key={sst._id} value={sst._id}>{sst.title}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // --- MATERIAL MUTATIONS ---
  const saveMaterial = async (e) => {
    e.preventDefault();
    if (!matForm.topic) return toast.error('Please select an associated Subtopic for this study material.');
    
    if (!editingMatId && !selectedFile) {
      return toast.error(`Please select a ${matForm.type === 'VIDEO' ? 'video' : 'document'} file to upload.`);
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('topic', matForm.topic);
      formData.append('title', matForm.title);
      formData.append('description', matForm.description);
      formData.append('type', matForm.type);
      formData.append('duration', matForm.duration);
      if (matForm.richTextContent) formData.append('richTextContent', matForm.richTextContent);
      if (matForm.videoUrl) formData.append('videoUrl', matForm.videoUrl);
      if (matForm.fileUrl) formData.append('fileUrl', matForm.fileUrl);

      if (selectedFile) {
        if (selectedFile.size > 100 * 1024 * 1024) {
          setIsUploading(false);
          return toast.error('Video is too large. Maximum size is 100MB.');
        }
        formData.append('file', selectedFile);
      }

      const wasEditing = editingMatId;
      
      const uploadConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      if (wasEditing) {
        await api.put(`/materials/${wasEditing}`, formData, uploadConfig);
        toast.success('🎉 Study Material updated successfully!');
      } else {
        await api.post('/materials/upload', formData, uploadConfig);
        toast.success('🎉 Study Material uploaded and published!');
      }
      queryClient.invalidateQueries(['adminMaterials']);
      setEditingMatId(null);
      setMatForm({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '' });
      setSelectedMatSubject('');
      setSelectedMatCategory('');
      setSelectedMatSubtopic('');
      setSelectedMatSubSubtopic('');
      setSelectedFile(null);
      if (wasEditing) navigate('/admin/materials/table');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save study material.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteMatMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMaterials']);
      toast.success('🗑️ Study material removed from database.');
    },
  });

  const handleEditMat = (item) => {
    navigate('/admin/materials/upload', { state: { editMatItem: item } });
    setEditingMatId(item._id);
    const subId = item.topic?._id || item.topic || '';
    setMatForm({
      topic: subId,
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'VIDEO',
      videoUrl: item.videoUrl || '',
      fileUrl: item.fileUrl || '',
      richTextContent: item.richTextContent || '',
      duration: item.duration || '',
    });

    const matchedSub = topics.find(t => t._id === subId || t._id?.toString() === subId?.toString());
    if (matchedSub) {
      if (matchedSub.parentTopic) {
        const parentId = matchedSub.parentTopic?._id || matchedSub.parentTopic;
        setSelectedMatSubtopic(parentId?.toString() || '');
        setSelectedMatSubSubtopic(matchedSub._id);
      } else {
        setSelectedMatSubtopic(matchedSub._id);
        setSelectedMatSubSubtopic('');
      }

      const catId = matchedSub.category?._id || matchedSub.category || '';
      setSelectedMatCategory(catId);
      const matchedCat = categories.find(c => c._id === catId || c._id?.toString() === catId?.toString());
      if (matchedCat) {
        setSelectedMatSubject(matchedCat.subject?._id || matchedCat.subject || '');
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- MCQ MUTATIONS ---
  const saveMCQ = async (e) => {
    e.preventDefault();
    if (!mcqForm.topic) return toast.error('Please select an associated Subtopic for this question.');

    try {
      const wasEditingMcq = editingMcqId;
      if (wasEditingMcq) {
        await api.put(`/quiz/${wasEditingMcq}`, mcqForm);
        toast.success('🎉 Practice MCQ updated successfully in database!');
      } else {
        await api.post('/quiz', mcqForm);
        toast.success('🎉 Practice MCQ added to topic question bank!');
      }
      queryClient.invalidateQueries(['adminMCQs']);
      setEditingMcqId(null);
      setMcqForm({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' });
      setSelectedMcqSubject('');
      setSelectedMcqCategory('');
      setSelectedMcqSubtopic('');
      setSelectedMcqSubSubtopic('');
      if (wasEditingMcq) navigate('/admin/mcqs/table');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save MCQ.');
    }
  };

  const deleteMcqMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/quiz/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMCQs']);
      toast.success('🗑️ MCQ removed from database.');
    },
  });

  const handleEditMcq = (item) => {
    navigate('/admin/mcqs/create', { state: { editMcqItem: item } });
    setEditingMcqId(item._id);
    const subId = item.topic?._id || item.topic || '';
    setMcqForm({
      topic: subId,
      question: item.question || '',
      optionA: item.optionA || '',
      optionB: item.optionB || '',
      optionC: item.optionC || '',
      optionD: item.optionD || '',
      correctAnswer: item.correctAnswer || 'C',
      difficulty: item.difficulty || 'Medium',
      explanation: item.explanation || '',
    });

    const matchedSub = topics.find(t => t._id === subId || t._id?.toString() === subId?.toString());
    if (matchedSub) {
      if (matchedSub.parentTopic) {
        const parentId = matchedSub.parentTopic?._id || matchedSub.parentTopic;
        setSelectedMcqSubtopic(parentId?.toString() || '');
        setSelectedMcqSubSubtopic(matchedSub._id);
      } else {
        setSelectedMcqSubtopic(matchedSub._id);
        setSelectedMcqSubSubtopic('');
      }

      const catId = matchedSub.category?._id || matchedSub.category || '';
      setSelectedMcqCategory(catId);
      const matchedCat = categories.find(c => c._id === catId || c._id?.toString() === catId?.toString());
      if (matchedCat) {
        setSelectedMcqSubject(matchedCat.subject?._id || matchedCat.subject || '');
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Hero Header & Mode Switcher */}
      <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-9 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-medicalPurple/5 via-primaryBlue/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#EAE5FF] text-[#7435D5] text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Content & Assessment Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight">
            {(activeTab === 'UPLOAD_MATERIALS' || activeTab === 'TABLE_MATERIALS' || activeTab === 'MATERIALS') 
              ? 'Manage Videos & Study Materials' 
              : 'Manage Practice MCQs & Board Quizzes'}
          </h1>
          <p className="text-sm font-medium text-muted mt-2 leading-relaxed">
            {(activeTab === 'UPLOAD_MATERIALS' || activeTab === 'TABLE_MATERIALS' || activeTab === 'MATERIALS')
              ? 'Attach MP4 video lectures, PDF clinical guidelines, or structured reading notes to specific lesson orbits.'
              : 'Construct board-format multiple choice practice questions, clinical vignettes, answer options, and study rationales.'}
          </p>
        </div>
      </div>

      {/* ======================= TAB 1: UPLOAD STUDY MATERIALS FORM ======================= */}
      {(activeTab === 'UPLOAD_MATERIALS' || activeTab === 'MATERIALS') && (
        <div className="space-y-6">
          {/* Material Editor Form */}
          <form onSubmit={saveMaterial} className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-soft space-y-5 relative">
            <div className="flex items-center justify-between mb-4 border-b border-borderLine pb-4">
              <h2 className="text-lg md:text-xl font-bold text-navy flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-primaryBlue" />
                <span>{editingMatId ? `Edit Material: "${matForm.title}"` : 'Upload New Study Module or Lecture Video'}</span>
              </h2>
              {editingMatId && (
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Editing Active Material
                </span>
              )}
            </div>

            {/* 4-Tier Cascading Curriculum Selection */}
            <div className="bg-[#EAF2FC]/60 p-5 rounded-lg border border-primaryBlue/20 space-y-4 mb-3">
              <div className="text-xs font-bold text-primaryBlue uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Step 1: Select Target Subject, Topic, Subtopic & Sub-Subtopic</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">1. Select Subject *</label>
                  <select
                    value={selectedMatSubject}
                    onChange={(e) => {
                      setSelectedMatSubject(e.target.value);
                      setSelectedMatCategory('');
                      setSelectedMatSubtopic('');
                      setSelectedMatSubSubtopic('');
                      setMatForm({ ...matForm, topic: '' });
                    }}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue shadow-xs"
                  >
                    <option value="">1. Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">2. Select Topic *</label>
                  <select
                    value={selectedMatCategory}
                    onChange={(e) => {
                      setSelectedMatCategory(e.target.value);
                      setSelectedMatSubtopic('');
                      setSelectedMatSubSubtopic('');
                      setMatForm({ ...matForm, topic: '' });
                    }}
                    disabled={!selectedMatSubject && categories.length > 0}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">2. Select Topic</option>
                    {matAvailableTopics.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">3. Select Subtopic *</label>
                  <select
                    value={selectedMatSubtopic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMatSubtopic(val);
                      setSelectedMatSubSubtopic('');
                      setMatForm({ ...matForm, topic: val });
                    }}
                    required
                    disabled={!selectedMatCategory && topics.length > 0}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-bold text-sm text-primaryBlue outline-none focus:border-primaryBlue shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">3. Select Subtopic</option>
                    {matAvailableSubtopics.map((t) => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 flex items-center justify-between">
                    <span>4. Subtopic's Subtopic</span>
                    {matAvailableSubSubtopics.length > 0 && (
                      <span className="text-[10px] text-primaryBlue font-semibold bg-blue-100 px-1.5 py-0.5 rounded">Optional</span>
                    )}
                  </label>
                  <select
                    value={selectedMatSubSubtopic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMatSubSubtopic(val);
                      setMatForm({ ...matForm, topic: val || selectedMatSubtopic });
                    }}
                    disabled={!selectedMatSubtopic || matAvailableSubSubtopics.length === 0}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-bold text-sm text-purple-700 outline-none focus:border-purple-600 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedMatSubtopic 
                        ? '4. Select Sub-subtopic' 
                        : matAvailableSubSubtopics.length === 0 
                          ? 'No Sub-subtopics present' 
                          : 'Attach to parent or select'}
                    </option>
                    {matAvailableSubSubtopics.map((t) => (
                      <option key={t._id} value={t._id}>└─ {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-navy mb-1.5">Material Format Type *</label>
              <select
                value={matForm.type}
                onChange={(e) => setMatForm({ ...matForm, type: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue"
              >
                <option value="VIDEO">Video Upload</option>
                <option value="PDF">Document Upload</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Material Title *</label>
              <input
                type="text"
                placeholder="e.g., Watch Video: Evolution of ASD Diagnostic Concepts"
                required
                value={matForm.title}
                onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-primaryBlue"
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
              <div className="bg-[#FFF5F5] p-5 rounded-lg border border-red-200/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                  <Video className="w-4 h-4" />
                  <span>Upload Video Lecture</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Attach Video File *</label>
                  <input
                    type="file"
                    required={!editingMatId}
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      if (file && file.type.startsWith('video/')) {
                        const videoNode = document.createElement('video');
                        videoNode.preload = 'metadata';
                        videoNode.onloadedmetadata = () => {
                          window.URL.revokeObjectURL(videoNode.src);
                          const duration = videoNode.duration;
                          const m = Math.floor(duration / 60);
                          const s = Math.floor(duration % 60);
                          const formattedDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
                          setMatForm(prev => ({ ...prev, duration: formattedDuration }));
                        };
                        videoNode.src = URL.createObjectURL(file);
                      }
                    }}
                    className="w-full max-w-md p-3 rounded-xl bg-white border border-borderLine text-xs font-bold text-navy file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FFE5E5] file:text-red-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-muted font-medium mt-1.5 flex items-center gap-1">
                    🔒 Students will watch this video exclusively inside the app. Their timestamp will be saved automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-secondaryBg/60 p-5 rounded-lg border border-borderLine">
                <div className="flex items-center gap-2 text-xs font-semibold text-primaryBlue uppercase tracking-wider">
                  <File className="w-4 h-4" />
                  <span>Upload Document</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Attach Document (PDF) *</label>
                  <input
                    type="file"
                    required={!editingMatId}
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full max-w-md p-3 rounded-xl bg-white border border-borderLine text-xs font-bold text-navy file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#E9F2FF] file:text-primaryBlue cursor-pointer"
                  />
                </div>
              </div>
            )}

            {isUploading && uploadProgress > 0 && (
              <div className="mt-6 mb-2">
                <div className="flex justify-between text-xs font-bold text-primaryBlue mb-1.5">
                  <span>Uploading to Cloud Server...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondaryBg rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-primaryBlue h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderLine">
              {editingMatId && (
                <button
                  type="button"
                  onClick={() => { setEditingMatId(null); setMatForm({ topic: '', title: '', description: '', type: 'VIDEO', videoUrl: '', fileUrl: '', richTextContent: '', duration: '24 min' }); setSelectedFile(null); setSelectedMatSubtopic(''); setSelectedMatSubSubtopic(''); navigate('/admin/materials/table'); }}
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
        </div>
      )}

      {/* ======================= TAB 2: PUBLISHED STUDY MATERIALS TABLE & FILTERS ======================= */}
      {activeTab === 'TABLE_MATERIALS' && (
        <div className="space-y-6">
          {renderFilterDashboard('text-primaryBlue', 'focus:border-primaryBlue', false)}

          {/* Materials List Table */}
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-soft overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7435D5]" />
                <span>Published Study Materials & Lectures ({filteredMaterials.length}{filteredMaterials.length !== materials.length ? ` of ${materials.length}` : ''})</span>
              </h3>
              
              <div className="flex p-1 bg-secondaryBg rounded-xl border border-borderLine overflow-x-auto">
                <button
                  onClick={() => setMatTypeTab('ALL')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${matTypeTab === 'ALL' ? 'bg-white text-navy shadow-sm border border-borderLine' : 'text-muted hover:text-navy'}`}
                >
                  All Materials
                </button>
                <button
                  onClick={() => setMatTypeTab('VIDEO')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${matTypeTab === 'VIDEO' ? 'bg-white text-navy shadow-sm border border-borderLine' : 'text-muted hover:text-navy'}`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setMatTypeTab('DOC')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${matTypeTab === 'DOC' ? 'bg-white text-navy shadow-sm border border-borderLine' : 'text-muted hover:text-navy'}`}
                >
                  Notes & PDFs
                </button>
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLine text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Material Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Associated Lesson</th>
                  <th className="py-3.5 px-4">Duration / Size</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
                {filteredMaterials.map((m) => (
                  <tr key={m._id} className="hover:bg-secondaryBg/80 transition-colors group">
                    <td className="py-4 px-4 font-bold flex items-center gap-3">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        m.type === 'VIDEO' ? 'bg-[#EAE5FF] text-[#7435D5]' :
                        m.type === 'NOTES' ? 'bg-[#E9F2FF] text-primaryBlue' : 'bg-[#EAF7ED] text-medicalGreen'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-muted">
                      <span className="bg-secondaryBg text-navy px-2.5 py-1 rounded-lg border border-borderLine">
                        🎯 {m.topic?.title || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-navy font-bold">{m.duration || 'Standard'}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewMaterial(m)}
                          className="p-2 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs hover:text-[#7435D5] transition-all"
                          title="View Material"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {m.type === 'VIDEO' && (
                          <button
                            onClick={() => setViewingCommentsForMaterial(m)}
                            className="p-2 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs hover:text-[#7435D5] transition-all"
                            title="View Student Comments"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
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
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted font-bold">
                      {materials.length === 0 ? 'No study materials published yet. Switch to Upload Material tab above!' : 'No study materials found matching your selected filters and search query.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: CREATE PRACTICE MCQS FORM ======================= */}
      {(activeTab === 'UPLOAD_MCQS' || activeTab === 'MCQS') && (
        <div className="space-y-6">
          <form onSubmit={saveMCQ} className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-soft space-y-5 relative">
            <div className="flex items-center justify-between mb-4 border-b border-borderLine pb-4">
              <h2 className="text-lg md:text-xl font-bold text-navy flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-medicalGreen" />
                <span>{editingMcqId ? `Edit Practice MCQ (#${editingMcqId})` : 'Construct New Practice MCQ for Lesson Assessment'}</span>
              </h2>
              {editingMcqId && (
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Editing Active Question
                </span>
              )}
            </div>

            {/* 4-Tier Cascading Assessment Selection */}
            <div className="bg-[#EDFAF3]/60 p-5 rounded-lg border border-medicalGreen/20 space-y-4 mb-3">
              <div className="text-xs font-bold text-medicalGreen uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Step 1: Select Target Subject, Topic, Subtopic & Sub-Subtopic</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">1. Select Subject *</label>
                  <select
                    value={selectedMcqSubject}
                    onChange={(e) => {
                      setSelectedMcqSubject(e.target.value);
                      setSelectedMcqCategory('');
                      setSelectedMcqSubtopic('');
                      setSelectedMcqSubSubtopic('');
                      setMcqForm({ ...mcqForm, topic: '' });
                    }}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen shadow-xs"
                  >
                    <option value="">-- 1. Select Subject --</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">2. Select Topic *</label>
                  <select
                    value={selectedMcqCategory}
                    onChange={(e) => {
                      setSelectedMcqCategory(e.target.value);
                      setSelectedMcqSubtopic('');
                      setSelectedMcqSubSubtopic('');
                      setMcqForm({ ...mcqForm, topic: '' });
                    }}
                    disabled={!selectedMcqSubject && categories.length > 0}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- 2. Select Topic --</option>
                    {mcqAvailableTopics.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">3. Select Subtopic *</label>
                  <select
                    value={selectedMcqSubtopic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMcqSubtopic(val);
                      setSelectedMcqSubSubtopic('');
                      setMcqForm({ ...mcqForm, topic: val });
                    }}
                    required
                    disabled={!selectedMcqCategory && topics.length > 0}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-bold text-sm text-medicalGreen outline-none focus:border-medicalGreen shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- 3. Select Subtopic --</option>
                    {mcqAvailableSubtopics.map((t) => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 flex items-center justify-between">
                    <span>4. Subtopic's Subtopic</span>
                    {mcqAvailableSubSubtopics.length > 0 && (
                      <span className="text-[10px] text-medicalGreen font-semibold bg-green-100 px-1.5 py-0.5 rounded">Optional</span>
                    )}
                  </label>
                  <select
                    value={selectedMcqSubSubtopic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMcqSubSubtopic(val);
                      setMcqForm({ ...mcqForm, topic: val || selectedMcqSubtopic });
                    }}
                    disabled={!selectedMcqSubtopic || mcqAvailableSubSubtopics.length === 0}
                    className="w-full p-3.5 rounded-xl bg-white border border-borderLine font-bold text-sm text-purple-700 outline-none focus:border-purple-600 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedMcqSubtopic 
                        ? '-- 4. Select Sub-subtopic --' 
                        : mcqAvailableSubSubtopics.length === 0 
                          ? '-- No Sub-subtopics present --' 
                          : '-- Attach to parent or select --'}
                    </option>
                    {mcqAvailableSubSubtopics.map((t) => (
                      <option key={t._id} value={t._id}>└─ {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Correct Answer Key *</label>
                <select
                  value={mcqForm.correctAnswer}
                  onChange={(e) => setMcqForm({ ...mcqForm, correctAnswer: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-medicalGreen outline-none focus:border-medicalGreen"
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
                  className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen"
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
                className="w-full p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-semibold text-sm text-navy outline-none focus:border-medicalGreen resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondaryBg/40 p-5 rounded-lg border border-borderLine">
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
                  onClick={() => { setEditingMcqId(null); setMcqForm({ topic: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'C', difficulty: 'Medium', explanation: '' }); setSelectedMcqSubtopic(''); setSelectedMcqSubSubtopic(''); navigate('/admin/mcqs/table'); }}
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
        </div>
      )}

      {/* ======================= TAB 4: MCQS QUESTION BANK TABLE & FILTERS ======================= */}
      {activeTab === 'TABLE_MCQS' && (
        <div className="space-y-6">
          {renderFilterDashboard('text-medicalGreen', 'focus:border-medicalGreen', true)}

          {/* MCQs List Table */}
          <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-8 shadow-soft overflow-x-auto">
            <h3 className="text-lg font-bold text-navy mb-5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-medicalGreen" />
              <span>Question Bank ({filteredMCQs.length}{filteredMCQs.length !== mcqs.length ? ` of ${mcqs.length}` : ''} Practice MCQs)</span>
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderLine text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/2">Question Vignette & Rationale</th>
                  <th className="py-3.5 px-4">Correct Key</th>
                  <th className="py-3.5 px-4">Associated Lesson</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLine/50 text-sm font-semibold text-navy">
                {filteredMCQs.map((q) => (
                  <tr key={q._id} className="hover:bg-secondaryBg/80 transition-colors group">
                    <td className="py-4 px-4 font-bold">
                      <div className="text-navy group-hover:text-medicalGreen transition-colors">{q.question}</div>
                      <div className="text-[11px] text-muted font-normal line-clamp-1 mt-1">💡 <strong>Rationale:</strong> {q.explanation}</div>
                    </td>
                    <td className="py-4 px-4 font-bold">
                      <span className="bg-[#EAF7ED] text-medicalGreen px-3 py-1 rounded-full text-xs font-bold shadow-xs border border-medicalGreen/20">
                        Option {q.correctAnswer}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-muted">
                      <span className="bg-secondaryBg text-navy px-2.5 py-1 rounded-lg border border-borderLine">
                        🎯 {q.topic?.title || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-lg font-semibold ${
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
                {filteredMCQs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted font-bold">
                      {mcqs.length === 0 ? 'No practice questions created yet. Switch to Create MCQ tab above!' : 'No practice MCQs found matching your selected filters and search query.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ======================= MATERIAL PREVIEW MODAL ======================= */}
      {previewMaterial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-navy/80 backdrop-blur-sm !mt-0">
          <div className="relative w-full max-w-7xl h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-borderLine bg-[#F8FAFC]">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                {previewMaterial.type === 'VIDEO' ? <Video className="w-5 h-5 text-[#7435D5]" /> : <BookOpen className="w-5 h-5 text-primaryBlue" />}
                Material Preview: <span className="font-bold text-muted">{previewMaterial.title}</span>
              </h3>
              <button 
                onClick={() => setPreviewMaterial(null)}
                className="p-2 rounded-xl bg-white hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] border border-borderLine shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-secondaryBg relative overflow-y-auto">
              {previewMaterial.type === 'VIDEO' ? (
                <video 
                  src={getFileUrl(previewMaterial.videoUrl || previewMaterial.fileUrl)} 
                  controls 
                  autoPlay
                  className="w-full h-full bg-black object-contain"
                />
              ) : previewMaterial.type === 'NOTES' ? (
                <div 
                  className="p-8 md:p-12 prose max-w-none text-navy bg-white min-h-full"
                  dangerouslySetInnerHTML={{ __html: previewMaterial.richTextContent || '<p>No content provided.</p>' }}
                />
              ) : previewMaterial.type === 'PDF' && previewMaterial.fileUrl ? (
                previewMaterial.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
                  <div className="w-full h-full flex justify-center items-center p-4 bg-white">
                    <img 
                      src={getFileUrl(previewMaterial.fileUrl)} 
                      alt={previewMaterial.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <iframe 
                    src={`${getFileUrl(previewMaterial.fileUrl)}#toolbar=0`}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Material Preview"
                  ></iframe>
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted font-bold">
                  Preview not available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    {/* Video Comments Modal */}
      {viewingCommentsForMaterial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden relative">
            <div className="p-6 md:p-8 border-b border-borderLine bg-secondaryBg/30 pr-16 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-primaryBlue" />
                  Student Feedback & Comments
                </h2>
                <p className="text-sm font-medium text-muted mt-1">
                  Viewing private comments for: <span className="text-navy font-bold">{viewingCommentsForMaterial.title}</span>
                </p>
              </div>
              <button 
                onClick={() => setViewingCommentsForMaterial(null)} 
                className="p-2 bg-white border border-borderLine rounded-full text-muted hover:text-navy hover:shadow-md transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-secondaryBg/10">
              {materialComments.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <h3 className="text-lg font-bold">No Comments Yet</h3>
                  <p className="text-sm">Students haven't submitted any questions for this video.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {materialComments.map(comment => (
                    <div key={comment._id} className="bg-white p-5 rounded-xl border border-borderLine shadow-sm flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#E9F2FF] text-primaryBlue font-bold flex items-center justify-center shrink-0">
                        {comment.user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="font-bold text-navy">{comment.user?.firstName} {comment.user?.lastName}</span>
                            <span className="text-xs text-muted ml-2">{comment.user?.email}</span>
                          </div>
                          <span className="text-xs font-semibold text-muted">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-navy/90 font-medium whitespace-pre-wrap mt-2 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageMaterials;
