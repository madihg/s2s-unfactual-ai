import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

export const runtime = 'nodejs';

// Client is created per request so the build does not require OPENAI_API_KEY.
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Browser posts the recorded audio here; the OpenAI key never leaves the server.
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const audio = form.get('file');
    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    const name = audio instanceof File && audio.name ? audio.name : 'audio.webm';
    const file = await toFile(Buffer.from(await audio.arrayBuffer()), name, {
      type: audio.type || 'audio/webm',
    });

    const transcription = await getOpenAI().audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
