import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('Groq API error:', errData);
      return NextResponse.json({ error: 'Groq API request failed', details: errData }, { status: 500 });
    }

    const data = await res.json();
    console.log('Groq response:', JSON.stringify(data, null, 2));

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error('No text in Groq response:', JSON.stringify(data));
      return NextResponse.json({ error: 'Empty response from Groq' }, { status: 500 });
    }

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error('Synthesis route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}