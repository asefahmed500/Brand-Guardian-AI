
import { detectGuidelineConflicts } from '@/ai/flows/detect-guideline-conflicts';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'brand_manager') {
    return NextResponse.json({ error: 'Forbidden', details: 'You do not have permission to perform this action.' }, { status: 403 });
  }

  try {
    const { brandFingerprint } = await req.json();

    if (!brandFingerprint) {
      return NextResponse.json({ error: 'Missing required field', details: 'brandFingerprint is required.' }, { status: 400 });
    }

    const result = await detectGuidelineConflicts({ brandFingerprint });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/detect-guideline-conflicts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to detect conflicts', details: errorMessage }, { status: 500 });
  }
}
