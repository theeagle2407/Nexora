'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JoinSession() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.length < 6) return;
    setError('');
    setLoading(true);

    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (err || !data) {
      setError('Session not found. Check the code and try again.');
      setLoading(false);
      return;
    }

    router.push(`/respond/${data.code}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Nexora</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Join a Session</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Enter the 6-character session code</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>
            Session Code
          </label>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AB12CD"
            maxLength={6}
            autoComplete="off"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '28px', fontWeight: '700', textAlign: 'center', letterSpacing: '8px', color: '#0f172a', backgroundColor: 'white', boxSizing: 'border-box', marginBottom: '20px' }}
          />

          <button
            onClick={handleJoin}
            disabled={loading}
            style={{ width: '100%', padding: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '20px' }}
          >
            {loading ? 'Finding session...' : 'Join Session'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}