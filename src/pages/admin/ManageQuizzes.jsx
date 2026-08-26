import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Plus, Trash2, Edit, Save, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const ManageQuizzes = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  
  const [form, setForm] = useState({
    topic: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    difficulty: 'Medium',
    explanation: ''
  });

  // Fetch all quizzes
  const { data: mcqData, isLoading: mcqLoading } = useQuery({
    queryKey: ['allMcqsAdmin'],
    queryFn: () => api.get('/quiz/admin/all'),
    staleTime: 20 * 1000,
  });
  const allMcqs = useMemo(() => mcqData?.mcqs || [], [mcqData]);

  // Fetch all topics to populate the dropdown
  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ['allTopicsAdmin'],
    queryFn: () => api.get('/topics?limit=500'),
    staleTime: 60 * 1000,
  });
  const allTopics = useMemo(() => topData?.topics || [], [topData]);

  // Flatten topics into a select list
  // Usually topics that can have resources are level 3, but the schema allows any topic.
  const topicOptions = allTopics.map(t => ({
    _id: t._id,
    title: t.title,
    parentTitle: t.parentTopic ? allTopics.find(p => p._id === t.parentTopic)?.title : (typeof t.category === 'object' ? t.category?.name : 'Root')
  })).sort((a, b) => a.parentTitle?.localeCompare(b.parentTitle));

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      topic: topicOptions.length > 0 ? topicOptions[0]._id : '',
      type: 'SINGLE',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      correctAnswers: [],
      matrixLeft: [{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }],
      matrixRight: [{ id: 'P', text: '' }, { id: 'Q', text: '' }, { id: 'R', text: '' }, { id: 'S', text: '' }],
      matrixMatches: [{ leftId: 'A', rightId: 'P' }, { leftId: 'B', rightId: 'Q' }, { leftId: 'C', rightId: 'R' }, { leftId: 'D', rightId: 'S' }],
      difficulty: 'Medium',
      explanation: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (mcq) => {
    setEditingId(mcq._id);
    setForm({
      topic: mcq.topic?._id || mcq.topic || '',
      type: mcq.type || 'SINGLE',
      question: mcq.question,
      optionA: mcq.optionA || '',
      optionB: mcq.optionB || '',
      optionC: mcq.optionC || '',
      optionD: mcq.optionD || '',
      correctAnswer: mcq.correctAnswer || 'A',
      correctAnswers: mcq.correctAnswers || [],
      matrixLeft: mcq.matrixLeft?.length ? mcq.matrixLeft : [{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }],
      matrixRight: mcq.matrixRight?.length ? mcq.matrixRight : [{ id: 'P', text: '' }, { id: 'Q', text: '' }, { id: 'R', text: '' }, { id: 'S', text: '' }],
      matrixMatches: mcq.matrixMatches?.length ? mcq.matrixMatches : [{ leftId: 'A', rightId: 'P' }, { leftId: 'B', rightId: 'Q' }, { leftId: 'C', rightId: 'R' }, { leftId: 'D', rightId: 'S' }],
      difficulty: mcq.difficulty || 'Medium',
      explanation: mcq.explanation
    });
    setIsModalOpen(true);
  };

  const handleMatrixMatchChange = (leftId, rightId) => {
    setForm(prev => {
      const newMatches = [...prev.matrixMatches];
      const idx = newMatches.findIndex(m => m.leftId === leftId);
      if (idx >= 0) newMatches[idx].rightId = rightId;
      else newMatches.push({ leftId, rightId });
      return { ...prev, matrixMatches: newMatches };
    });
  };

  const toggleCorrectAnswer = (opt) => {
    setForm(prev => {
      const current = prev.correctAnswers || [];
      if (current.includes(opt)) {
        return { ...prev, correctAnswers: current.filter(o => o !== opt) };
      } else {
        return { ...prev, correctAnswers: [...current, opt] };
      }
    });
  };

  const saveMcq = async (e) => {
    e.preventDefault();
    if (!form.topic) {
      toast.error('Please select a topic for the quiz');
      return;
    }
    
    try {
      if (editingId) {
        await api.put(`/quiz/${editingId}`, form);
        toast.success('🎉 MCQ updated successfully!');
      } else {
        await api.post('/quiz', form);
        toast.success('🎉 MCQ added to Assessment Bank!');
      }
      queryClient.invalidateQueries({ queryKey: ['allMcqsAdmin'] });
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save MCQ');
    }
  };

  const deleteMcq = (id, questionText) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete MCQ',
      message: `Are you sure you want to delete MCQ: "${questionText.substring(0, 50)}..."?`,
      onConfirm: async () => {
        setConfirmConfig({ ...confirmConfig, isOpen: false });
        try {
          await api.delete(`/quiz/${id}`);
          queryClient.invalidateQueries({ queryKey: ['allMcqsAdmin'] });
          toast.success('🗑️ MCQ removed.');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete MCQ');
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="bg-white border border-borderLine rounded-xl p-8 shadow-soft flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-primaryBlue" />
            Global Quiz & MCQ Bank
          </h1>
          <p className="text-sm font-medium text-muted mt-2">
            Manage all Multiple Choice Questions across the entire curriculum.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" /> Add New MCQ
        </button>
      </div>

      {mcqLoading || topLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Topic Assignment</th>
                  <th className="py-4 px-6">Question Stem</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Correct Answer</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allMcqs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-muted font-medium">
                      No quizzes found in the global bank.
                    </td>
                  </tr>
                ) : (
                  allMcqs.map(mcq => (
                    <tr key={mcq._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-primaryBlue bg-primaryBlue/10 px-2 py-1 rounded-md">
                          {mcq.topic?.title || 'Unknown Topic'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-navy line-clamp-2">
                        {mcq.question}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase ${
                          mcq.difficulty === 'Easy' ? 'bg-medicalGreen/10 text-medicalGreen' :
                          mcq.difficulty === 'Hard' || mcq.difficulty === 'Clinical Case' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {mcq.difficulty || 'Medium'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-navy">
                        Option {mcq.correctAnswer}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(mcq)}
                            className="p-2 rounded-lg hover:bg-white text-muted hover:text-primaryBlue transition-colors shadow-xs border border-transparent hover:border-borderLine"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMcq(mcq._id, mcq.question)}
                            className="p-2 rounded-lg hover:bg-white text-muted hover:text-red-600 transition-colors shadow-xs border border-transparent hover:border-borderLine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MCQ Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-borderLine flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primaryBlue" />
                {editingId ? 'Edit Global MCQ' : 'Create New MCQ'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-navy transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="mcq-form" onSubmit={saveMcq} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Assign to Topic *</label>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none transition-all text-sm font-medium"
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    {topicOptions.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.parentTitle ? `${t.parentTitle} ➔ ${t.title}` : t.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Question Type *</label>
                  <select
                    value={form.type || 'SINGLE'}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none transition-all text-sm font-medium mb-4"
                  >
                    <option value="SINGLE">Single Choice</option>
                    <option value="MULTIPLE">Multiple Choice</option>
                    <option value="MATRIX">Matrix Match</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Clinical Question Stem *</label>
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none transition-all resize-none text-sm font-medium"
                    placeholder="e.g., A 25-year-old male presents with..."
                    rows="3"
                    required
                  />
                </div>
                
                {form.type !== 'MATRIX' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt}>
                        <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Option {opt} *</label>
                        <input
                          type="text"
                          value={form[`option${opt}`]}
                          onChange={(e) => setForm({ ...form, [`option${opt}`]: e.target.value })}
                          className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue outline-none text-sm font-medium"
                          placeholder={`Choice ${opt}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                {form.type === 'MATRIX' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-borderLine">
                    <div>
                      <h4 className="text-xs font-bold text-navy mb-3 uppercase tracking-wider">List I (Left)</h4>
                      {form.matrixLeft?.map((item, idx) => (
                        <div key={item.id} className="mb-3 flex items-center gap-2">
                          <span className="font-bold text-gray-500 w-6">{item.id}.</span>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              const newLeft = [...form.matrixLeft];
                              newLeft[idx].text = e.target.value;
                              setForm({ ...form, matrixLeft: newLeft });
                            }}
                            className="w-full p-2 rounded bg-white border border-borderLine focus:border-primaryBlue outline-none text-sm"
                            placeholder="Item text"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy mb-3 uppercase tracking-wider">List II (Right)</h4>
                      {form.matrixRight?.map((item, idx) => (
                        <div key={item.id} className="mb-3 flex items-center gap-2">
                          <span className="font-bold text-gray-500 w-6">{item.id}.</span>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              const newRight = [...form.matrixRight];
                              newRight[idx].text = e.target.value;
                              setForm({ ...form, matrixRight: newRight });
                            }}
                            className="w-full p-2 rounded bg-white border border-borderLine focus:border-primaryBlue outline-none text-sm"
                            placeholder="Item text"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.type === 'SINGLE' && (
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Correct Answer *</label>
                      <select
                        value={form.correctAnswer}
                        onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                        className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue outline-none text-sm font-medium"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                  )}

                  {form.type === 'MULTIPLE' && (
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Correct Answers *</label>
                      <div className="flex gap-4 p-3 rounded-xl bg-secondaryBg border border-borderLine">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.correctAnswers?.includes(opt)}
                              onChange={() => toggleCorrectAnswer(opt)}
                              className="w-4 h-4 text-primaryBlue focus:ring-primaryBlue border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-navy">Opt {opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.type === 'MATRIX' && (
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Correct Matches *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-secondaryBg border border-borderLine">
                        {form.matrixLeft?.map(left => (
                          <div key={left.id} className="flex items-center gap-2">
                            <span className="font-bold text-navy">{left.id} →</span>
                            <select
                              value={form.matrixMatches?.find(m => m.leftId === left.id)?.rightId || ''}
                              onChange={(e) => handleMatrixMatchChange(left.id, e.target.value)}
                              className="p-2 rounded bg-white border border-borderLine focus:border-primaryBlue outline-none text-sm w-full"
                            >
                              <option value="" disabled>Select</option>
                              {form.matrixRight?.map(right => (
                                <option key={right.id} value={right.id}>{right.id}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Difficulty Level</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue outline-none text-sm font-medium"
                    >
                      <option value="Easy">Easy (Recall)</option>
                      <option value="Medium">Medium (Application)</option>
                      <option value="Hard">Hard (Analysis)</option>
                      <option value="Clinical Case">Clinical Case Vignette</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Educational Rationale & Explanation *</label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none transition-all resize-none text-sm font-medium"
                    placeholder="Explain why the correct answer is right and others are wrong..."
                    rows="3"
                    required
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-borderLine bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-navy bg-white border border-borderLine hover:bg-secondaryBg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="mcq-form"
                className="btn-primary"
              >
                {editingId ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default ManageQuizzes;
