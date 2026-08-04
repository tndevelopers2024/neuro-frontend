import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark as BookmarkIcon, Trash2, ArrowRight, Search, FileText, Play, Brain } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';

const Bookmarks = () => {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch bookmarks from backend
  const { data: bData, isLoading } = useQuery({
    queryKey: ['userBookmarks', filterType],
    queryFn: () => api.get(`/user/bookmarks?type=${filterType}`),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/user/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['userBookmarks']);
      toast.success('Bookmark removed from your personal favorites.');
    },
  });

  const bookmarks = bData?.bookmarks || [
    { _id: 'b1', title: 'History of ASD', subtitle: 'Child Psychiatry → Autism Spectrum Disorder', link: '/lesson/history-of-asd', targetType: 'Topic', icon: 'Bookmark' },
    { _id: 'b2', title: 'Watch Video: Evolution of ASD Concepts', subtitle: 'Leo Kanner & Hans Asperger Lecture', link: '/video/1', targetType: 'Video', icon: 'Play' },
    { _id: 'b3', title: 'Read Lecture Notes: Comprehensive Synthesis', subtitle: 'Diagnostic DSM comparison charts', link: '/notes/1', targetType: 'Notes', icon: 'FileText' },
  ];

  const filtered = bookmarks.filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-6xl mx-auto">
      <Breadcrumb items={[{ title: 'Home', link: '/' }, { title: 'Personal Bookmarks & Favorites' }]} />

      <div className="bg-white border border-borderLine rounded-3xl p-7 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight flex items-center gap-2.5">
            <BookmarkIcon className="w-7 h-7 text-primaryBlue fill-primaryBlue/20" /> Personal Bookmarks
          </h1>
          <p className="text-sm font-medium text-muted mt-1">
            Access your saved high-yield clinical lessons, video modules, and reading syntheses instantly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((bm) => (
          <div key={bm._id} className="medical-card flex flex-col justify-between group relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-[#E9F2FF] text-primaryBlue">
                  {bm.targetType || 'Saved Topic'}
                </span>
                <button
                  onClick={() => deleteMutation.mutate(bm._id)}
                  title="Remove Bookmark"
                  className="p-1.5 rounded-lg text-muted hover:text-[#DC2626] hover:bg-[#FFF2F2] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-black text-navy group-hover:text-primaryBlue transition-colors">{bm.title}</h3>
              <p className="text-xs font-semibold text-muted mt-1 leading-relaxed">{bm.subtitle}</p>
            </div>

            <Link
              to={bm.link || '/'}
              className="mt-6 pt-4 border-t border-borderLine/70 flex items-center justify-between text-xs font-bold text-primaryBlue group-hover:underline"
            >
              <span>Launch Learning Item</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
