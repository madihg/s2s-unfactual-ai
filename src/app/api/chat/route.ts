import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Client is created per request so the build does not require OPENAI_API_KEY.
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const completion = await getOpenAI().chat.completions.create({
      model: 'ft:gpt-3.5-turbo-1106:personal::AiQwMKEF',
      messages,
      stream: false,
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
