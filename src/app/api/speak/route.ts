import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

// Client is created per request so the build does not require OPENAI_API_KEY.
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Text-to-speech proxied through the server so the OpenAI key stays private.
export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const speech = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text.slice(0, 4096),
    });

    return new NextResponse(Buffer.from(await speech.arrayBuffer()), {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('Speech error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
