
import { applyBrandFixes } from '@/ai/flows/apply-brand-fixes';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
    }

    const { designDataUri, brandGuidelines, fixes } = await req.json();

    if (!designDataUri || !brandGuidelines || !fixes) {
      return NextResponse.json({ error: 'Missing required fields', details: 'designDataUri, brandGuidelines, and fixes are required.' }, { status: 400 });
    }

    const result = await applyBrandFixes({
      designDataUri,
      brandGuidelines,
      fixes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/apply-brand-fixes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to apply fixes', details: errorMessage }, { status: 500 });
  }
}
