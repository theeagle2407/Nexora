'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Brain, ArrowLeft, Users, BarChart3, FileText, Shield, Check, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { storeDecisionRecord } from '@/lib/filecoin';

type Question = {
  id: string;
  text: string;
  order_index: number;
};

type MemberResponse = {
  id: string;
  question_id: string;
  member_name: string;
  position: string;
  reasoning: string;
  created_at: string;
};

type Session = {
  id: string;
  code: string;
  title: string;
  created_by: string;
};

const POSITION_LABELS: Record<string, string> = {
  strongly_agree: 'Strongly Agree',
  agree: 'Agree',
  neutral: 'Neutral',
  disagree: 'Disagree',
  strongly_disagree: 'Strongly Disagree',
};

const POSITION_COLORS: Record<string, string> = {
  strongly_agree: '#16a34a',
  agree: '#34d399',
  neutral: '#94a3b8',
  disagree: '#fb923c',
  strongly_disagree: '#ef4444',
};

const POSITION_LIGHT: Record<string, string> = {
  strongly_agree: 'bg-green-100 text-green-800 border-green-200',
  agree: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  disagree: 'bg-orange-100 text-orange-800 border-orange-200',
  strongly_disagree: 'bg-red-100 text-red-800 border-red-200',
};

function getSynthesis(responses: MemberResponse[], questions: Question[]) {
  return questions.map((q) => {
    const qResponses = responses.filter((r) => r.question_id === q.id);
    const counts: Record<string, number> = {};
    qResponses.forEach((r) => {
      counts[r.position] = (counts[r.position] || 0) + 1;
    });

    const total = qResponses.length;
    const agreeCount = (counts['strongly_agree'] || 0) + (counts['agree'] || 0);
    const disagreeCount = (counts['strongly_disagree'] || 0) + (counts['disagree'] || 0);

    let consensus = 'Split';
    if (total === 0) consensus = 'No responses';
    else if (agreeCount / total >= 0.85) consensus = 'Strong Agreement';
    else if (agreeCount / total >= 0.7) consensus = 'Leaning Agree';
    else if (disagreeCount / total >= 0.85) consensus = 'Strong Disagreement';
    else if (disagreeCount / total >= 0.7) consensus = 'Leaning Disagree';
    else if ((counts['neutral'] || 0) / total >= 0.5) consensus = 'Mostly Neutral';

    const uniquePositions = Object.keys(counts).length;
    const diversity = uniquePositions >= 4 ? 'High' : uniquePositions === 3 ? 'Medium' : 'Low';

    return { question: q, counts, total, consensus, diversity, responses: qResponses };
  });
}

function FilecoinSection({ stored, storing, onStore, disabled }: {
  stored: { cid: string; gateway: string } | null;
  storing: boolean;
  onStore: () => void;
  disabled: boolean;
}) {
  if (stored) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-800">Stored on Filecoin</span>
        </div>
        <p className="text-xs text-green-700 font-mono mb-3 break-all">CID: {stored.cid}</p>
        <Link
          href={stored.gateway}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 underline"
        >
          View on IPFS gateway
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={onStore}
      disabled={storing || disabled}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Shield className="w-5 h-5" />
      {storing ? 'Storing on Filecoin...' : 'Store Decision on Filecoin'}
    </button>
  );
}

export default function ResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<MemberResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeQ, setActiveQ] = useState(0);
  const [storing, setStoring] = useState(false);
  const [stored, setStored] = useState<{ cid: string; gateway: string } | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && code) fetchData();
  }, [user, code]);

  const fetchData = async () => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single();

    if (sessionError || !sessionData) {
      setError('Session not found.');
      setPageLoading(false);
      return;
    }

    setSession(sessionData);

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('session_id', sessionData.id)
      .order('order_index');

    const { data: responsesData } = await supabase
      .from('responses')
      .select('*')
      .eq('session_id', sessionData.id)
      .order('created_at');

    setQuestions(questionsData || []);
    setResponses(responsesData || []);
    setPageLoading(false);
  };

  const handleStoreOnFilecoin = async () => {
    if (!session) return;
    setStoring(true);
    try {
      const synthesis = getSynthesis(responses, questions);
      const synthesisText = synthesis
        .map(s => `${s.question.text}: ${s.consensus} (${s.total} responses, diversity: ${s.diversity})`)
        .join(' | ');

      const result = await storeDecisionRecord({
        sessionCode: session.code,
        title: session.title,
        questions: questions.map(q => ({ text: q.text })),
        responses: responses.map(r => ({
          member_name: r.member_name,
          position: r.position,
          reasoning: r.reasoning,
        })),
        synthesis: synthesisText,
        timestamp: new Date().toISOString(),
      });

      if (result.success && result.cid && result.gateway) {
        setStored({ cid: result.cid, gateway: result.gateway });
      }
    } catch (err) {
      console.error('Storage error:', err);
    } finally {
      setStoring(false);
    }
  };

  const handleAiSynthesis = async () => {
    if (!session || responses.length === 0) return;
    setAiLoading(true);
    setAiSummary('');

    try {
      const prompt = `You are an expert decision facilitator analyzing group responses for a session titled "${session.title}".

Here are the questions and responses:

${questions.map((q) => {
  const qResponses = responses.filter(r => r.question_id === q.id);
  return `Question: ${q.text}
Responses:
${qResponses.map(r => `- ${r.member_name} (${POSITION_LABELS[r.position] || r.position}): "${r.reasoning}"`).join('\n')}`;
}).join('\n\n')}

Please provide:
1. A brief overall summary of the group's collective stance
2. Key areas of agreement
3. Key areas of disagreement or tension
4. A recommended next step for the group

Be concise, insightful, and actionable. Use plain text, no markdown.`;

      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setAiSummary(data.summary || 'No summary generated.');
    } catch (err) {
      console.error('AI synthesis error:', err);
      setAiSummary('Failed to generate summary. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const synthesis = getSynthesis(responses, questions);
  const uniqueMembers = [...new Set(responses.map((r) => r.member_name))];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(71,85,105,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Nexora</span>
            </div>
            <span className="text-sm text-slate-500">{user?.email}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">

          <Link href={`/session/${code}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to session
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-bold text-slate-900">{session?.title}</h1>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">{code}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{uniqueMembers.length}</p>
                <p className="text-xs text-slate-500">Members</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <FileText className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
                <p className="text-xs text-slate-500">Questions</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <BarChart3 className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{responses.length}</p>
                <p className="text-xs text-slate-500">Responses</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <FilecoinSection
                stored={stored}
                storing={storing}
                onStore={handleStoreOnFilecoin}
                disabled={responses.length === 0}
              />
              <button
                onClick={handleAiSynthesis}
                disabled={aiLoading || responses.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                {aiLoading ? 'Generating...' : 'AI Synthesis'}
              </button>
            </div>
          </div>

          {aiSummary && (
            <div className="bg-white rounded-2xl border border-violet-200 shadow-xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Decision Summary</h2>
                  <p className="text-xs text-slate-500">Generated by Gemini</p>
                </div>
              </div>
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{aiSummary}</p>
              </div>
            </div>
          )}

          {responses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 text-center">
              <p className="text-slate-500 text-lg mb-2">No responses yet</p>
              <p className="text-slate-400">Share the session code <strong>{code}</strong> with your team</p>
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQ(i)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeQ === i
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Q{i + 1}
                  </button>
                ))}
              </div>

              {synthesis[activeQ] && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                    <p className="text-sm font-semibold text-blue-600 mb-2">Question {activeQ + 1}</p>
                    <h2 className="text-xl font-bold text-slate-900 mb-6">{synthesis[activeQ].question.text}</h2>

                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm font-semibold text-slate-700">Opinion Distribution</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        synthesis[activeQ].consensus === 'Strong Agreement' ? 'bg-green-100 text-green-700 border-green-200' :
                        synthesis[activeQ].consensus === 'Strong Disagreement' ? 'bg-red-100 text-red-700 border-red-200' :
                        synthesis[activeQ].consensus === 'Split' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {synthesis[activeQ].consensus}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(POSITION_LABELS).map(([key, label]) => {
                        const count = synthesis[activeQ].counts[key] || 0;
                        const pct = synthesis[activeQ].total > 0
                          ? Math.round((count / synthesis[activeQ].total) * 100)
                          : 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-slate-600">{label}</span>
                              <span className="text-sm font-bold text-slate-900">
                                {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                              <div
                                className="h-5 rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: POSITION_COLORS[key],
                                  minWidth: count > 0 ? '20px' : '0px',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-6 text-sm text-slate-500">
                      <span>
                        Cognitive Diversity:{' '}
                        <strong className={
                          synthesis[activeQ].diversity === 'High' ? 'text-orange-600' :
                          synthesis[activeQ].diversity === 'Medium' ? 'text-blue-600' :
                          'text-green-600'
                        }>
                          {synthesis[activeQ].diversity}
                        </strong>
                      </span>
                      <span>{synthesis[activeQ].total} response{synthesis[activeQ].total !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Individual Responses</h3>
                    <div className="space-y-4">
                      {synthesis[activeQ].responses.map((r) => (
                        <div key={r.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-900">{r.member_name}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${POSITION_LIGHT[r.position]}`}>
                              {POSITION_LABELS[r.position]}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{r.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}