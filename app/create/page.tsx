'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateSession() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [user, loading, router]);

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    setCreating(true);
    setError('');

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error: err } = await supabase
      .from('sessions')
      .insert({ title: title.trim(), code, created_by: user.id })
      .select()
      .single();

    if (err || !data) {
      setError('Failed to create session. Try again.');
      setCreating(false);
      return;
    }

    // Register on NEAR blockchain
    try {
      const nearRes = await fetch('/api/near', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCode: data.code, sessionTitle: data.title }),
      });

      const nearResult = await nearRes.json();
      console.log('NEAR result:', nearResult);

      if (nearResult.success && nearResult.txHash) {
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            near_tx_hash: nearResult.txHash,
            near_explorer_url: nearResult.explorer,
          })
          .eq('id', data.id);

        if (updateError) {
          console.error('Failed to save NEAR tx hash:', updateError);
        } else {
          console.log('NEAR tx hash saved to Supabase:', nearResult.txHash);
        }
      }
    } catch (nearErr) {
      console.error('NEAR registration error (non-critical):', nearErr);
    }

    // Wait for Supabase to sync before redirecting
    await new Promise(resolve => setTimeout(resolve, 800));

    router.push(`/session/${data.code}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(71,85,105,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900">Nexora</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create a Session</h1>
          <p className="text-slate-600">Give your decision session a clear title</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          <label className="block text-sm font-semibold text-slate-900 mb-2">Session Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Q3 Product Strategy"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-white mb-4"
          />
          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating & Registering on NEAR...' : 'Create Session'}
          </button>
          <p className="text-xs text-slate-500 mt-3 text-center">
            ⛓️ Session will be registered on NEAR testnet
          </p>
        </div>
      </div>
    </div>
  );
}