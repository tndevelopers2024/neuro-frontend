import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Edit3, Save, Search, Sparkles, X, Eye } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import { CardSkeleton } from '../../components/common/Skeleton.jsx';

const MyNotes = () => {
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', topicTitle: 'General Clinical Note' });
  const queryClient = useQueryClient();

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['myNotes'],
    queryFn: () => api.get('/user/notes'),
    staleTime: 60 * 1000,
  });

  const notes = notesData?.notes || [
    { _id: 'n1', title: 'Resident Rounds: Autism Screening Tools', content: 'Key clinical differentiator: M-CHAT-R/F is performed between 16-30 months during pediatric visits. ADOS-2 remains the gold standard semi-structured evaluation tool across the entire lifespan.', topicTitle: 'History of ASD & Assessment', updatedAt: new Date().toISOString() },
    { _id: 'n2', title: 'DSM-5 Sensory Hyper/Hypo Reactivity', content: 'Remember to ask parents about olfactory sensitivities and hyper-reactivity to everyday auditory textures when evaluating repetitive restricted behaviors in toddlers.', topicTitle: 'Clinical Features of ASD', updatedAt: new Date().toISOString() },
  ];

  const saveMutation = useMutation({
    mutationFn: (data) => (editingId ? api.put(`/user/notes/${editingId}`, data) : api.post('/user/notes', data)),
    onSuccess: () => {
      queryClient.invalidateQueries(['myNotes']);
      toast.success(editingId ? 'Study note updated!' : 'New study note created and indexed!');
      setShowEditor(false);
      setEditingId(null);
      setForm({ title: '', content: '', topicTitle: 'General Clinical Note' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/user/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['myNotes']);
      toast.success('Study note deleted securely.');
    },
  });

  const handleEdit = (n) => {
    setEditingId(n._id);
    setForm({ title: n.title, content: n.content, topicTitle: n.topicTitle || 'General' });
    setShowEditor(true);
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-7xl mx-auto">
      <Breadcrumb items={[{ title: 'Home', link: '/' }, { title: 'Personal Study Notes Vault' }]} />

      <div className="bg-white border border-borderLine rounded-xl p-7 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primaryBlue" /> Resident Study Vault
          </h1>
          <p className="text-sm font-medium text-muted mt-1">
            Create, edit, and print your custom study notes synchronized across all your interactive lesson sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes vault..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-secondaryBg border border-borderLine font-medium text-xs text-navy focus:bg-white focus:border-primaryBlue outline-none"
            />
          </div>
          <button
            onClick={() => { setEditingId(null); setForm({ title: '', content: '', topicTitle: 'General Note' }); setShowEditor(true); }}
            className="btn-primary text-xs py-2.5 px-4"
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      </div>

      {showEditor && (
        <div className="bg-white border border-primaryBlue/30 rounded-xl p-7 shadow-elevated animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-borderLine pb-3">
            <h3 className="text-lg font-semibold text-navy">{editingId ? 'Edit Study Note' : 'Create New Study Note'}</h3>
            <button onClick={() => setShowEditor(false)} className="p-1 text-muted hover:text-navy"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Note Title (e.g., Round 1 Clinical Reflections)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-bold text-sm text-navy outline-none"
            />
            <input
              type="text"
              placeholder="Associated Topic (e.g., Autism Spectrum Disorder)"
              value={form.topicTitle}
              onChange={(e) => setForm({ ...form, topicTitle: e.target.value })}
              className="p-3.5 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none"
            />
          </div>
          <textarea
            rows={8}
            placeholder="Take notes here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-4 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none resize-none shadow-inner/30"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowEditor(false)} className="btn-secondary text-xs">Cancel</button>
            <button onClick={() => saveMutation.mutate(form)} className="btn-primary text-xs">
              <Save className="w-4 h-4" /> Save Note to Vault
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted font-semibold bg-white border border-borderLine rounded-xl">
            No notes found.
          </div>
        ) : (
          filteredNotes.map((note) => (
          <div key={note._id} className="bg-white border border-borderLine rounded-xl p-7 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-secondaryBg text-primaryBlue border border-borderLine text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  {note.topicTitle || 'Clinical Note'}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(note)} className="p-2 rounded-lg hover:bg-secondaryBg text-muted hover:text-primaryBlue transition-colors" title="Edit Note">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(note._id)} className="p-2 rounded-lg hover:bg-[#FFF2F2] text-muted hover:text-[#DC2626] transition-colors" title="Delete Note">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-navy">{note.title}</h3>
              <p className="text-sm font-medium text-muted mt-3 leading-relaxed whitespace-pre-line line-clamp-4">
                {note.content}
              </p>
              <button 
                onClick={() => setViewingNote(note)} 
                className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primaryBlue hover:underline"
              >
                 <Eye className="w-4 h-4" /> View Full Note
              </button>
            </div>
            <div className="mt-6 pt-3 border-t border-borderLine/70 text-[11px] font-semibold text-muted/80 flex items-center justify-between">
              <span>Synchronized securely in cloud</span>
              <span>Updated: {new Date(note.updatedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        )))}
      </div>

      {/* View Note Modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
            <div className="p-6 md:p-8 border-b border-borderLine bg-secondaryBg/30 pr-16">
              <span className="bg-white text-primaryBlue border border-borderLine shadow-xs text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                {viewingNote.topicTitle || 'Clinical Note'}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-navy">{viewingNote.title}</h2>
              <button 
                onClick={() => setViewingNote(null)} 
                className="p-2 bg-white border border-borderLine rounded-full text-muted hover:text-navy hover:shadow-md transition-all absolute top-6 right-6"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              <p className="text-sm md:text-base font-medium text-navy/80 leading-relaxed whitespace-pre-wrap">
                {viewingNote.content}
              </p>
            </div>
            <div className="p-5 bg-secondaryBg border-t border-borderLine text-xs font-bold text-muted flex justify-between items-center">
               <span>Synchronized securely in cloud</span>
               <span>Updated: {new Date(viewingNote.updatedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotes;
