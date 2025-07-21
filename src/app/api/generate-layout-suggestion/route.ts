
import { generateLayoutSuggestion } from '@/ai/flows/generate-layout-suggestion';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
  }

  try {
    const { brandFingerprint, headline, bodyText, imagePrompt } = await req.json();

    if (!brandFingerprint) {
      return NextResponse.json({ error: 'Missing required field', details: 'brandFingerprint is required.' }, { status: 400 });
    }

    const result = await generateLayoutSuggestion({ brandFingerprint, headline, bodyText, imagePrompt });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/generate-layout-suggestion:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate layout', details: errorMessage }, { status: 500 });
  }
}
