
import { generateBrandTemplates } from '@/ai/flows/generate-brand-templates';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
  }

  try {
    const { brandGuidelines, templateCount } = await req.json();

    if (!brandGuidelines) {
      return NextResponse.json({ error: 'Missing required field', details: 'brandGuidelines is required.' }, { status: 400 });
    }

    const result = await generateBrandTemplates({ brandGuidelines, templateCount: templateCount || 3 });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/generate-brand-templates:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate templates', details: errorMessage }, { status: 500 });
  }
}
