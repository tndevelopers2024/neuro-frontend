import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers, ArrowLeft, ArrowRight, RotateCw, Sparkles, Shuffle, BookOpen, Search, X } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';

const Flashcards = () => {
  const { topicSlug = 'all' } = useParams();
  const navigate = useNavigate();
  const [currIndex, setCurrIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAllTopics = topicSlug === 'all';

  // Fetch topics list if on the main flashcards route
  const { data: topicsData, isLoading: isLoadingTopics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => api.get('/topics'),
    enabled: isAllTopics,
  });

  // Fetch flashcards for topic
  const { data: cardData, isLoading: isLoadingCards } = useQuery({
    queryKey: ['flashcards', topicSlug],
    queryFn: () => api.get(`/flashcards/${topicSlug}`),
    enabled: !isAllTopics,
    staleTime: 0,
  });

  const flashcards = useMemo(() => {
    let cards = cardData?.flashcards;
    if (!cards || cards.length === 0) {
      if (isAllTopics) return []; // Don't use fallback if just in topic selection mode
      cards = [
        {
          _id: 'c1',
          frontTerm: 'Leo Kanner (1943) Classic Paper Title',
          backDefinition: '"Autistic Disturbances of Affective Contact" – documented 11 children exhibiting profound preference for aloneness and obsessive preservation of sameness.',
          categoryTag: 'Historical Pioneers',
          topic: { title: 'History of ASD', color: '#7435D5' },
        },
        {
          _id: 'c2',
          frontTerm: 'DSM-5 Diagnostic Criteria Dyad for ASD',
          backDefinition: '(1) Persistent deficits in social communication & social interaction across multiple contexts.\n(2) Restricted, repetitive patterns of behavior, interests, or activities (now explicitly including sensory hyper/hypo reactivity).',
          categoryTag: 'Diagnostic Nosology',
          topic: { title: 'History of ASD', color: '#126BEE' },
        },
        {
          _id: 'c3',
          frontTerm: 'M-CHAT-R/F Pediatric Screening Age Windows',
          backDefinition: 'Administered systematically between 16-30 months during routine well-child primary pediatric visits to detect early autism developmental risk flags.',
          categoryTag: 'Clinical Assessment',
          topic: { title: 'Assessment & Diagnosis', color: '#21A447' },
        },
      ];
    } else {
      cards = [...cards];
    }

    // Shuffle the cards using Fisher-Yates
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }, [cardData, isAllTopics]);

  if (isAllTopics) {
    if (isLoadingTopics) {
      return <NeonBrainLoader text="Loading Topics..." />;
    }

    const topics = topicsData?.topics || [];
    
    const filteredTopics = topics.filter(topic => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (topic.title && topic.title.toLowerCase().includes(q)) ||
        (topic.description && topic.description.toLowerCase().includes(q))
      );
    });

    return (
      <div className="space-y-6 animate-fadeIn pb-16 max-w-7xl mx-auto">
        <Breadcrumb items={[{ title: 'Home', link: '/' }, { title: 'Flashcard Decks' }]} />

        <div className="bg-white border border-borderLine rounded-xl p-7 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy tracking-tight flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-primaryBlue fill-primaryBlue/20" /> Flashcard Decks
            </h1>
            <p className="text-sm font-medium text-muted mt-1">
              Select a clinical topic to start an active recall training session.
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-muted hover:text-navy transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="py-20 text-center font-bold text-navy flex flex-col items-center gap-3 bg-white border border-borderLine rounded-xl shadow-soft">
            <Layers className="w-12 h-12 text-gray-300 mb-2" />
            <span>No topics available.</span>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="py-20 text-center font-bold text-navy flex flex-col items-center gap-3 bg-white border border-borderLine rounded-xl shadow-soft">
            <Search className="w-12 h-12 text-gray-300 mb-2" />
            <span>No topics found matching "{searchQuery}".</span>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 px-4 py-2 bg-primaryBlue text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <div
                key={topic._id}
                onClick={() => navigate(`/flashcards/${topic.slug}`)}
                className="medical-card flex flex-col justify-between group relative cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-[#E9F2FF] text-primaryBlue">
                      Topic Deck
                    </span>
                    <div
                      style={{ backgroundColor: `${topic.color || '#126BEE'}15`, color: topic.color || '#126BEE' }}
                      className="p-1.5 rounded-lg border border-current/20 group-hover:scale-110 transition-transform"
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-navy group-hover:text-primaryBlue transition-colors line-clamp-1">{topic.title}</h3>
                  {topic.description && (
                    <p className="text-xs font-semibold text-muted mt-1 leading-relaxed line-clamp-2">{topic.description}</p>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-borderLine/70 flex items-center justify-between text-xs font-bold text-primaryBlue group-hover:underline">
                  <span>Start Deck</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentCard = flashcards[currIndex] || flashcards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (isLoadingCards) {
    return <NeonBrainLoader text="Loading Flashcard Memory Decks..." />;
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn pb-16 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/flashcards/all')}
            className="flex items-center gap-2 text-sm font-semibold text-primaryBlue hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Topics
          </button>
        </div>
        <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3 bg-white border border-borderLine rounded-xl shadow-soft">
          <Layers className="w-10 h-10 text-muted" />
          <span>No flashcards available for this topic yet.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/flashcards/all')}
          className="flex items-center gap-2 text-sm font-semibold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Topics
        </button>
        <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Active Recall Deck ({currIndex + 1} of {flashcards.length})
        </span>
      </div>

      {/* 3D Interactive CSS Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-96 [perspective:1200px] cursor-pointer group select-none"
      >
        <div
          className={`relative w-full h-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] shadow-elevated border border-borderLine ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Face of Card */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-xl p-10 flex flex-col justify-between [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-secondaryBg text-muted border border-borderLine">
                {currentCard.categoryTag || 'Clinical Term'}
              </span>
              <span className="text-xs font-bold text-primaryBlue flex items-center gap-1 group-hover:underline">
                <RotateCw className="w-3.5 h-3.5" /> Click card to flip definition
              </span>
            </div>

            <div className="text-center my-auto px-6">
              <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tight leading-normal">
                {currentCard.frontTerm}
              </h2>
            </div>

            <div className="text-center pt-4 border-t border-borderLine/60 text-xs font-bold text-muted uppercase tracking-wider">
              {currentCard.topic?.title || 'Psychiatry Core Curriculum'}
            </div>
          </div>

          {/* Back Face of Card (Answer) */}
          <div className="absolute inset-0 w-full h-full bg-[#FAFCFF] rounded-xl p-10 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] border border-primaryBlue/30 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="bg-[#E9F2FF] text-primaryBlue text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Clinical Definition & Rationale
              </span>
              <span className="text-xs font-bold text-muted flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Flip back
              </span>
            </div>

            <div className="my-auto px-6 overflow-y-auto max-h-56">
              <p className="text-base md:text-lg font-bold text-navy whitespace-pre-line leading-relaxed text-center">
                {currentCard.backDefinition}
              </p>
            </div>

            <div className="text-center pt-4 border-t border-borderLine/60 text-xs font-semibold text-medicalGreen">
              ✨ Mastered concept! Use navigation below for next card.
            </div>
          </div>
        </div>
      </div>

      {/* Deck Controls */}
      <div className="flex items-center justify-between pt-4">
        <button onClick={handlePrev} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Previous Card
        </button>

        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrIndex(Math.floor(Math.random() * flashcards.length));
          }}
          className="p-3 rounded-xl bg-secondaryBg hover:bg-white text-navy border border-borderLine shadow-xs"
          title="Shuffle Deck"
        >
          <Shuffle className="w-5 h-5 text-primaryBlue" />
        </button>

        <button onClick={handleNext} className="btn-primary">
          <span>Next Card</span> <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
