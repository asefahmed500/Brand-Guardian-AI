
import { promptToDesign } from '@/ai/flows/prompt-to-design';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
  }

  try {
    const { brandFingerprint, prompt } = await req.json();

    if (!brandFingerprint || !prompt) {
      return NextResponse.json({ error: 'Missing required fields', details: 'brandFingerprint and prompt are required.' }, { status: 400 });
    }

    const result = await promptToDesign({ brandFingerprint, prompt });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/prompt-to-design:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate design from prompt', details: errorMessage }, { status: 500 });
  }
}
