'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Brain, Plus, LogIn, LogOut, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Session = {
  id: string;
  code: string;
  title: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('created_by', user?.id)
      .order('created_at', { ascending: false });

    setSessions(data || []);
    setSessionsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Nexora</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-500 text-lg">Manage your sessions or join one</p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link href="/create" className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1 block">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Create Session</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Start a new decision session, add questions, and invite your team with a unique code.
              </p>
            </Link>

            <Link href="/join" className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-300 hover:-translate-y-1 block">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Join Session</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Have a session code? Enter it to participate and submit your answers.
              </p>
            </Link>
          </div>

          {/* My Sessions */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Sessions</h2>

            {sessionsLoading ? (
              <div className="text-slate-500">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <p className="text-slate-500 mb-2">No sessions yet</p>
                <p className="text-slate-400 text-sm">Create your first session to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{session.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{session.code}</span>
                        <span className="text-sm text-slate-400">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {session.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/results/${session.code}`}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        Results
                      </Link>
                      <Link
                        href={`/session/${session.code}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        Manage
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
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