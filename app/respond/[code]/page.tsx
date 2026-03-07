'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Brain, ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Question = {
  id: string;
  text: string;
  order_index: number;
};

type Session = {
  id: string;
  code: string;
  title: string;
};

const POSITIONS = [
  { value: 'strongly_agree', label: 'Strongly Agree' },
  { value: 'agree', label: 'Agree' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'disagree', label: 'Disagree' },
  { value: 'strongly_disagree', label: 'Strongly Disagree' },
];

export default function RespondPage() {
  const params = useParams();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [memberName, setMemberName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { position: string; reasoning: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSession();
  }, [code]);

  const fetchSession = async () => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single();

    if (sessionError || !sessionData) {
      setError('Session not found.');
      setLoading(false);
      return;
    }

    setSession(sessionData);

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('session_id', sessionData.id)
      .order('order_index');

    setQuestions(questionsData || []);
    setLoading(false);
  };

  const handleSubmitAll = async () => {
    if (!session) return;
    setSubmitting(true);

    try {
      // Encrypt member identity with Lit Protocol (privacy-preserving identity)
      const { encryptResponse } = await import('@/lib/lit');
      const encryptedIdentity = await encryptResponse(memberName.trim(), session.id);

      const inserts = questions.map((q) => ({
        question_id: q.id,
        session_id: session.id,
        member_name: memberName.trim(),
        position: answers[q.id]?.position || '',
        reasoning: answers[q.id]?.reasoning || '',
        encrypted: !encryptedIdentity.fallback,
        encryption_hash: encryptedIdentity.dataToEncryptHash || '',
        access_conditions: encryptedIdentity.accessControlConditions || null,
      }));

      const { error: err } = await supabase.from('responses').insert(inserts);

      if (err) {
        setError('Failed to submit. Please try again.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQ];
  const currentAnswer = answers[currentQuestion?.id] || { position: '', reasoning: '' };
  const isLastQuestion = currentQ === questions.length - 1;
  const currentAnswered = currentAnswer.position && currentAnswer.reasoning.trim();
  const allAnswered = questions.every(q => answers[q.id]?.position && answers[q.id]?.reasoning?.trim());

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading session...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
          <Link href="/join" style={{ color: '#2563eb' }}>Try again</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check style={{ width: '40px', height: '40px', color: '#16a34a' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Responses Submitted!</h1>
          <p style={{ color: '#64748b', marginBottom: '12px' }}>
            Thank you <strong>{memberName}</strong>. Your identity has been encrypted with Lit Protocol.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
            🔒 Privacy-preserving identity protection active
          </p>
          <Link href="/" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: '700', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!nameSubmitted) {
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
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>{session?.title}</h1>
            <p style={{ color: '#64748b', margin: 0 }}>{questions.length} question{questions.length !== 1 ? 's' : ''} to answer</p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>What is your name?</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Your identity will be encrypted with Lit Protocol.</p>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Enter your name..."
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '16px', color: '#0f172a', backgroundColor: 'white', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <button
              onClick={() => setNameSubmitted(true)}
              disabled={!memberName.trim()}
              style={{ width: '100%', padding: '14px', backgroundColor: memberName.trim() ? '#0f172a' : '#94a3b8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: memberName.trim() ? 'pointer' : 'not-allowed' }}
            >
              Start Answering
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{session?.title}</span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Question {currentQ + 1} of {questions.length}</span>
          </div>
          <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', height: '6px' }}>
            <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, backgroundColor: '#2563eb', height: '6px', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>
            {currentQuestion?.text}
          </h2>

          <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>Your position</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {POSITIONS.map((pos) => (
              <button
                key={pos.value}
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: { ...currentAnswer, position: pos.value } })}
                style={{
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: currentAnswer.position === pos.value ? '2px solid #2563eb' : '2px solid #e2e8f0',
                  backgroundColor: currentAnswer.position === pos.value ? '#eff6ff' : 'white',
                  color: currentAnswer.position === pos.value ? '#1d4ed8' : '#334155',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {currentAnswer.position === pos.value ? '✓ ' : ''}{pos.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
            Your reasoning <span style={{ color: '#94a3b8', fontWeight: '400' }}>(required)</span>
          </p>
          <textarea
            value={currentAnswer.reasoning}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: { ...currentAnswer, reasoning: e.target.value } })}
            placeholder="Explain your position..."
            rows={4}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '15px', color: '#0f172a', backgroundColor: 'white', boxSizing: 'border-box', resize: 'vertical', marginBottom: '24px', fontFamily: 'inherit' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentQ(currentQ - 1)}
              disabled={currentQ === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: 'white', color: currentQ === 0 ? '#cbd5e1' : '#334155', fontWeight: '600', cursor: currentQ === 0 ? 'not-allowed' : 'pointer', fontSize: '15px' }}
            >
              <ChevronLeft style={{ width: '18px', height: '18px' }} />
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitAll}
                disabled={!allAnswered || submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: allAnswered ? '#16a34a' : '#94a3b8', color: 'white', fontWeight: '700', cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: '15px' }}
              >
                <Check style={{ width: '18px', height: '18px' }} />
                {submitting ? 'Encrypting & Submitting...' : 'Submit Responses'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ(currentQ + 1)}
                disabled={!currentAnswered}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: currentAnswered ? '#0f172a' : '#94a3b8', color: 'white', fontWeight: '700', cursor: currentAnswered ? 'pointer' : 'not-allowed', fontSize: '15px' }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', backgroundColor: i === currentQ ? '#0f172a' : answers[q.id]?.position ? '#2563eb' : '#cbd5e1', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}