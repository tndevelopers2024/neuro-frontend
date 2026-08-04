import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ArrowLeft, CheckCircle2, Bookmark as BookmarkIcon, Printer, Sparkles } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const NoteReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch note material details from backend
  const { data: resData, isLoading } = useQuery({
    queryKey: ['materialNote', id],
    queryFn: () => api.get(`/materials/${id}`),
    staleTime: 10 * 60 * 1000,
  });

  const material = resData?.material || {
    title: 'Read Lecture Notes: Comprehensive Synthesis',
    description: 'Structured clinical notes on Autism Spectrum Disorder evolution.',
    richTextContent: `
      <h2 class="text-2xl font-black text-[#071A5C] mt-4 mb-3">Historical Foundations of Autism Spectrum Disorder</h2>
      <p class="text-base leading-relaxed text-[#64748B] mb-6">The concept of Autism Spectrum Disorder has undergone dramatic clinical evolution over the past 80 years. Initially misclassified under schizophrenia spectrum symptoms, modern psychiatry now categorizes ASD as a neurodevelopmental disorder characterized by early-onset social-communication deficits and repetitive sensorimotor behaviors.</p>
      
      <h3 class="text-lg font-bold text-[#071A5C] mt-6 mb-3">Key Historical Milestones</h3>
      <ul class="space-y-3 pl-5 list-disc text-sm font-semibold text-[#071A5C]">
        <li><strong class="text-[#126BEE]">1911 (Eugen Bleuler):</strong> First coined the term <em>"autism"</em> (from Greek <em>autos</em> meaning self) to describe the idiosyncratic withdrawal observed in adult schizophrenia patients.</li>
        <li><strong class="text-[#126BEE]">1943 (Leo Kanner):</strong> Published landmark classic paper <em>"Autistic Disturbances of Affective Contact"</em> detailing 11 children who exhibited profound preference for aloneness and intense obsessive desire for the preservation of sameness.</li>
        <li><strong class="text-[#126BEE]">1944 (Hans Asperger):</strong> Working independently in Vienna, published a paper on <em>"Autistic Psychopathy"</em> describing older boys with impaired empathy and idiosyncratic special interests but preserved grammar and superior intelligence.</li>
        <li><strong class="text-[#126BEE]">1980 (DSM-III):</strong> For the very first time, autism was separated entirely from childhood schizophrenia and officially recognized under Pervasive Developmental Disorders (PDD).</li>
        <li><strong class="text-[#126BEE]">2013 (DSM-5):</strong> Created an overarching diagnostic continuum ("Autism Spectrum Disorder") subsuming Autistic Disorder, Asperger Syndrome, and PDD-NOS into a unified Dyad of Impairments.</li>
      </ul>

      <div class="mt-8 bg-[#F8FAFF] p-6 rounded-2xl border-l-4 border-l-[#126BEE] border border-[#E7ECF5] shadow-sm">
        <h4 class="text-base font-black text-[#071A5C] mb-2">💎 Clinical Pearl for Residents</h4>
        <p class="text-sm text-[#64748B] leading-relaxed m-0">Remember the diagnostic shift: DSM-IV required a classic triad (social, communication, stereotypies), whereas DSM-5 unified social and communicative impairments into a single domain while explicitly adding <strong>hypo- or hyper-reactivity to sensory stimuli</strong> under restricted behaviors.</p>
      </div>
    `,
  };

  const handleMarkDone = async () => {
    try {
      await api.post('/progress/update', {
        topicId: material.topic?._id || '64aaaaa00000000000000001',
        materialId: material._id || id,
        materialType: 'NOTES',
        progressPercentage: 100,
      });
      toast.success('📖 Clinical reading marked as Mastered!', { icon: '🏆' });
    } catch (e) {
      toast.success('📖 Clinical reading completed!');
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Sparkles className="w-10 h-10 text-primaryBlue animate-spin" />
        <span>Loading Clinical Note Synthesis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-extrabold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lesson Overview
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-muted" /> Print / Export PDF
          </button>
          <button
            onClick={handleMarkDone}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-medicalGreen hover:bg-[#1C8D3C] text-white font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark as Mastered
          </button>
        </div>
      </div>

      <div className="bg-white border border-borderLine rounded-3xl p-8 md:p-12 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Comprehensive Lecture Synthesis
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-navy tracking-tight mb-4">{material.title}</h1>
        <div className="w-full h-[1px] bg-borderLine my-6" />

        {/* Render Structured HTML Reading Content */}
        <div
          className="prose max-w-none text-navy"
          dangerouslySetInnerHTML={{ __html: material.richTextContent || '<p>Structured study content is loading...</p>' }}
        />
      </div>
    </div>
  );
};

export default NoteReader;
