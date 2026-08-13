import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers, ArrowLeft, ArrowRight, RotateCw, Sparkles, Shuffle } from 'lucide-react';
import api from '../../api/axiosInstance.js';

const Flashcards = () => {
  const { topicSlug = 'all' } = useParams();
  const navigate = useNavigate();
  const [currIndex, setCurrIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Fetch flashcards for topic or all available memory drills
  const { data: cardData, isLoading } = useQuery({
    queryKey: ['flashcards', topicSlug],
    queryFn: () => api.get(`/flashcards/${topicSlug}`),
    staleTime: 5 * 60 * 1000,
  });

  const flashcards = cardData?.flashcards || [
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

  const currentCard = flashcards[currIndex] || flashcards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Layers className="w-10 h-10 text-primaryBlue animate-bounce" />
        <span>Loading Flashcard Memory Decks...</span>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn pb-16 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-extrabold text-primaryBlue hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Curriculum
          </button>
        </div>
        <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3 bg-white border border-borderLine rounded-3xl shadow-soft">
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-extrabold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Curriculum
        </button>
        <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Active Recall Deck ({currIndex + 1} of {flashcards.length})
        </span>
      </div>

      {/* 3D Interactive CSS Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-96 [perspective:1200px] cursor-pointer group select-none"
      >
        <div
          className={`relative w-full h-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-elevated border border-borderLine ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Face of Card */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-10 flex flex-col justify-between [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-secondaryBg text-muted border border-borderLine">
                {currentCard.categoryTag || 'Clinical Term'}
              </span>
              <span className="text-xs font-bold text-primaryBlue flex items-center gap-1 group-hover:underline">
                <RotateCw className="w-3.5 h-3.5" /> Click card to flip definition
              </span>
            </div>

            <div className="text-center my-auto px-6">
              <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight leading-normal">
                {currentCard.frontTerm}
              </h2>
            </div>

            <div className="text-center pt-4 border-t border-borderLine/60 text-xs font-bold text-muted uppercase tracking-wider">
              {currentCard.topic?.title || 'Psychiatry Core Curriculum'}
            </div>
          </div>

          {/* Back Face of Card (Answer) */}
          <div className="absolute inset-0 w-full h-full bg-[#FAFCFF] rounded-3xl p-10 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-primaryBlue/30 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="bg-[#E9F2FF] text-primaryBlue text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
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

            <div className="text-center pt-4 border-t border-borderLine/60 text-xs font-extrabold text-medicalGreen">
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
