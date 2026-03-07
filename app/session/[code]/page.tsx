'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Brain, Copy, Check, Trash2, Plus, BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type Question = {
  id: string;
  text: string;
  order_index: number;
};

type Session = {
  id: string;
  code: string;
  title: string;
  status: string;
  created_by: string;
  near_tx_hash: string | null;
  near_explorer_url: string | null;
};

export default function SessionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && code) fetchSession();
  }, [user, code]);

  const fetchSession = async () => {
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single();

    if (!sessionData) {
      router.push('/dashboard');
      return;
    }

    setSession(sessionData);

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('session_id', sessionData.id)
      .order('order_index');

    setQuestions(questionsData || []);
    setPageLoading(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !session) return;
    setAdding(true);

    const { data } = await supabase
      .from('questions')
      .insert({
        session_id: session.id,
        text: newQuestion.trim(),
        order_index: questions.length,
      })
      .select()
      .single();

    if (data) {
      setQuestions([...questions, data]);
      setNewQuestion('');
    }
    setAdding(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await supabase.from('questions').delete().eq('id', questionId);
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100"></div>
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
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">

          {/* NEAR Banner */}
          {session?.near_tx_hash && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Registered on NEAR Testnet</p>
                  <p className="text-xs text-green-600 font-mono">{session.near_tx_hash}</p>
                </div>
              </div>
              {session.near_explorer_url && (
                <Link
                  href={session.near_explorer_url}
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-semibold underline"
                >
                  View on Explorer
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{session?.title}</h1>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{session?.status}</span>
              </div>
              <Link
                href={`/results/${code}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-all text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                View Results
              </Link>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Session Code — Share with your team</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold font-mono text-slate-900 tracking-widest">{code}</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Questions</h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                placeholder="Type a question..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-white"
              />
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestion.trim() || adding}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No questions yet. Add your first question above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="group flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                    <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-slate-700 font-medium">{q.text}</p>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}