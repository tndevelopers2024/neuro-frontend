import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, Award, Sparkles } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const QuizPlayer = () => {
  const { topicSlug = 'history-of-asd' } = useParams();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: 'C', 1: 'C' }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch MCQs for topic
  const { data: quizData, isLoading } = useQuery({
    queryKey: ['topicMCQs', topicSlug],
    queryFn: () => api.get(`/quiz/topic/${topicSlug}`),
    staleTime: 5 * 60 * 1000,
  });

  const topic = quizData?.topic || {};
  const mcqs = quizData?.mcqs || [];

  const handleOptionSelect = (optLetter) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optLetter });
  };

  const handleFinalSubmit = async () => {
    let correctCount = 0;
    mcqs.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    const calcPercentage = Math.round((correctCount / mcqs.length) * 100);
    setScore(calcPercentage);
    setIsSubmitted(true);

    try {
      await api.post('/quiz/submit', {
        topicId: topic._id,
        totalQuestions: mcqs.length,
        correctAnswers: correctCount,
        timeTakenSeconds: 120,
      });
      toast.success(`Quiz Graded! Score: ${calcPercentage}% (${correctCount}/${mcqs.length} correct) 🎓`, { duration: 5000 });
    } catch (e) {
      toast.success(`Quiz evaluated! Score: ${calcPercentage}% 🎓`);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setScore(0);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Sparkles className="w-10 h-10 text-medicalGreen animate-spin" />
        <span>Loading Clinical Board Quizzes...</span>
      </div>
    );
  }

  if (!mcqs || mcqs.length === 0) {
    return (
      <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3">
        <span>No questions found for this quiz.</span>
        <button onClick={() => navigate(-1)} className="text-primaryBlue hover:underline mt-2 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const currentQ = mcqs[currentIdx];

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Quiz Module
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-[#EAF7ED] text-medicalGreen text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            {currentQ.difficulty || 'Clinical Vignette'}
          </span>
          <span className="bg-secondaryBg text-navy text-xs font-bold px-3 py-1 rounded-full border border-borderLine">
            Question {currentIdx + 1} of {mcqs.length}
          </span>
        </div>
      </div>

      {/* Main Quiz Board Card */}
      <div className="bg-white border border-borderLine rounded-xl p-8 md:p-10 shadow-soft relative overflow-hidden">
        {isSubmitted && (
          <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-[#F8FAFF] to-[#EAF7ED] border border-borderLine flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 text-medicalGreen shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-navy">Assessment Complete! Final Score: {score}%</h3>
                <p className="text-xs font-medium text-muted">Review the correct board explanations highlighted in green below.</p>
              </div>
            </div>
            <button onClick={resetQuiz} className="btn-secondary text-xs px-4 py-2">
              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
            </button>
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-bold text-navy tracking-tight leading-relaxed mb-8">
          {currentQ.question}
        </h2>

        {/* Options Radio Cards */}
        <div className="space-y-4">
          {['A', 'B', 'C', 'D'].map((letter) => {
            const optionText = currentQ[`option${letter}`];
            if (!optionText) return null;

            const isSelected = selectedAnswers[currentIdx] === letter;
            const isCorrect = currentQ.correctAnswer === letter;

            let cardStyle = 'bg-secondaryBg border-borderLine text-navy hover:bg-white hover:border-primaryBlue/40';
            if (isSelected && !isSubmitted) {
              cardStyle = 'bg-[#E9F2FF] border-primaryBlue text-primaryBlue font-bold ring-2 ring-primaryBlue/20';
            }
            if (isSubmitted) {
              if (isCorrect) {
                cardStyle = 'bg-[#EAF7ED] border-medicalGreen text-medicalGreen font-bold ring-2 ring-medicalGreen/30';
              } else if (isSelected && !isCorrect) {
                cardStyle = 'bg-[#FFF2F2] border-[#DC2626] text-[#DC2626] font-bold ring-2 ring-[#DC2626]/20';
              } else {
                cardStyle = 'bg-white/60 border-borderLine/60 text-muted opacity-60';
              }
            }

            return (
              <div
                key={letter}
                onClick={() => handleOptionSelect(letter)}
                className={`p-5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${cardStyle}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${
                    isSelected ? 'bg-current text-white border-transparent' : 'bg-white border-borderLine text-navy'
                  }`}>
                    {letter}
                  </div>
                  <span className="text-sm font-semibold">{optionText}</span>
                </div>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-medicalGreen shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Clinical Rationale Explanation Block */}
        {isSubmitted && currentQ.explanation && (
          <div className="mt-8 p-6 rounded-lg bg-[#F8FAFF] border-l-4 border-l-primaryBlue border border-borderLine animate-fadeIn">
            <h4 className="text-sm font-semibold text-navy uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primaryBlue" /> Clinical Board Rationale
            </h4>
            <p className="text-sm font-medium text-muted leading-relaxed m-0">{currentQ.explanation}</p>
          </div>
        )}

        {/* Navigation & Submission Toolbar */}
        <div className="mt-10 pt-6 border-t border-borderLine flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="btn-secondary disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Question
          </button>

          <div className="flex items-center gap-3">
            {!isSubmitted && currentIdx === mcqs.length - 1 && (
              <button onClick={handleFinalSubmit} className="bg-medicalGreen hover:bg-[#1C8D3C] text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all">
                Submit & Grade Quiz 🎯
              </button>
            )}

            {currentIdx < mcqs.length - 1 && (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(mcqs.length - 1, prev + 1))}
                className="btn-primary"
              >
                <span>Next Question</span> <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;
