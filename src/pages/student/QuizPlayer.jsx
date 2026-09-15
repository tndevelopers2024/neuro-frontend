import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, RotateCcw, Award, Sparkles } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';
import MatrixMatchInteractive from '../../components/quiz/MatrixMatchInteractive.jsx';

const QuizPlayer = () => {
  const { topicSlug = 'history-of-asd' } = useParams();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: 'C', 1: 'C' }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Fetch MCQs for topic
  const { data: quizData, isLoading } = useQuery({
    queryKey: ['topicMCQs', topicSlug],
    queryFn: () => api.get(`/quiz/topic/${topicSlug}`),
    staleTime: 5 * 60 * 1000,
  });

  const topic = quizData?.topic || {};
  
  // Memoize and shuffle MCQs when data is loaded or when quiz is retaken
  const mcqs = React.useMemo(() => {
    if (!quizData?.mcqs) return [];
    return [...quizData.mcqs].sort(() => Math.random() - 0.5);
  }, [quizData, shuffleSeed]);

  const handleOptionSelect = (optLetter) => {
    if (isSubmitted) return;
    const qType = mcqs[currentIdx].type || 'SINGLE';
    if (qType === 'SINGLE') {
      setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optLetter });
    } else if (qType === 'MULTIPLE') {
      const current = selectedAnswers[currentIdx] || [];
      let next;
      if (current.includes(optLetter)) {
        next = current.filter(o => o !== optLetter);
      } else {
        next = [...current, optLetter];
      }
      setSelectedAnswers({ ...selectedAnswers, [currentIdx]: next });
    }
  };

  const handleMatrixSelect = (leftId, rightId) => {
    if (isSubmitted) return;
    const current = selectedAnswers[currentIdx] || {};
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: { ...current, [leftId]: rightId }
    });
  };

  const handleFinalSubmit = async () => {
    let correctCount = 0;
    mcqs.forEach((q, idx) => {
      const qType = q.type || 'SINGLE';
      const ans = selectedAnswers[idx];

      if (qType === 'SINGLE') {
        if (ans === q.correctAnswer) correctCount += 1;
      } else if (qType === 'MULTIPLE') {
        const correctArray = q.correctAnswers || [];
        const studentArray = ans || [];
        if (correctArray.length > 0 && correctArray.length === studentArray.length) {
          const isCorrect = correctArray.every(opt => studentArray.includes(opt));
          if (isCorrect) correctCount += 1;
        }
      } else if (qType === 'MATRIX') {
        const correctMatches = q.matrixMatches || [];
        const studentMatches = ans || {};
        let isCorrect = true;
        if (correctMatches.length === 0) isCorrect = false;
        correctMatches.forEach(m => {
          if (studentMatches[m.leftId] !== m.rightId) {
            isCorrect = false;
          }
        });
        if (isCorrect) correctCount += 1;
      }
    });
    const calcPercentage = Math.round((correctCount / mcqs.length) * 100);
    setScore(calcPercentage);
    setIsSubmitted(true);
    setShowResultModal(true);

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
    setShowResultModal(false);
    setCurrentIdx(0);
    setScore(0);
    setShuffleSeed(prev => prev + 1);
  };

  if (isLoading) {
    return <NeonBrainLoader text="Loading Clinical Board Quizzes..." />;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Quiz Module
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-[#EAF7ED] text-medicalGreen text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1 rounded-full uppercase tracking-wider">
            {currentQ.difficulty || 'Clinical Vignette'}
          </span>
          <span className="bg-secondaryBg text-navy text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full border border-borderLine">
            Question {currentIdx + 1} of {mcqs.length}
          </span>
        </div>
      </div>

      {/* Main Quiz Board Card */}
      <div className="bg-white border border-borderLine rounded-xl p-5 sm:p-8 md:p-10 shadow-soft relative overflow-hidden">
        {isSubmitted && (
          <div className="mb-8 p-4 sm:p-6 rounded-lg bg-gradient-to-r from-[#F8FAFF] to-[#EAF7ED] border border-borderLine flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-medicalGreen shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-navy">Assessment Complete! Final Score: {score}%</h3>
                <p className="text-xs font-medium text-muted">Review the correct board explanations highlighted in green below.</p>
              </div>
            </div>
            <button onClick={resetQuiz} className="btn-secondary text-xs px-4 py-2 self-stretch sm:self-auto justify-center">
              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
            </button>
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-bold text-navy tracking-tight leading-relaxed mb-8">
          {currentQ.question}
        </h2>

        {/* Options Radio Cards */}
        <div className="space-y-4">
          {(!currentQ.type || currentQ.type === 'SINGLE') && ['A', 'B', 'C', 'D'].map((letter) => {
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

          {currentQ.type === 'MULTIPLE' && ['A', 'B', 'C', 'D'].map((letter) => {
            const optionText = currentQ[`option${letter}`];
            if (!optionText) return null;
            const currentSelected = selectedAnswers[currentIdx] || [];
            const isSelected = currentSelected.includes(letter);
            const isCorrect = currentQ.correctAnswers?.includes(letter);

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
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-sm font-bold border ${
                    isSelected ? 'bg-primaryBlue border-transparent' : 'bg-white border-borderLine'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm font-semibold">{optionText}</span>
                </div>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-medicalGreen shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />}
              </div>
            );
          })}

          {currentQ.type === 'MATRIX' && (
            <MatrixMatchInteractive
              currentQ={currentQ}
              selectedAnswers={selectedAnswers}
              currentIdx={currentIdx}
              isSubmitted={isSubmitted}
              onMatrixSelect={handleMatrixSelect}
            />
          )}
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

      {/* Result Modal Popup */}
      {showResultModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-slideUp">
            
            <div className={`p-8 text-center text-white ${
              score >= 80 ? 'bg-gradient-to-br from-medicalGreen to-[#1C8D3C]' : 
              score >= 60 ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]' : 
              'bg-gradient-to-br from-[#EF4444] to-[#DC2626]'
            }`}>
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold mb-1">{score}%</h2>
              <p className="text-white/80 font-semibold uppercase tracking-widest text-xs">
                {score >= 80 ? 'Exceptional Mastery' : score >= 60 ? 'Passing Score' : 'Needs Review'}
              </p>
            </div>
            
            <div className="p-8 text-center bg-white">
              <p className="text-navy font-bold text-lg mb-2">Quiz Completed!</p>
              <p className="text-muted text-sm mb-8">
                You correctly answered <span className="font-bold text-navy">{Math.round((score / 100) * mcqs.length)}</span> out of <span className="font-bold text-navy">{mcqs.length}</span> questions.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowResultModal(false)}
                  className="w-full btn-primary py-3"
                >
                  Review Detailed Explanations
                </button>
                <button 
                  onClick={resetQuiz}
                  className="w-full bg-secondaryBg hover:bg-[#E9F2FF] text-navy hover:text-primaryBlue font-bold py-3 rounded-xl border border-borderLine transition-colors"
                >
                  Retake Quiz
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;
