
import { brandAssistant } from '@/ai/flows/brand-assistant';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      // In a real addon, you might use a different authentication method like an API key.
      // For this demo, we'll allow unauthenticated access for the addon if no session exists.
      console.log('No session found, proceeding for addon demo.');
    }

    const { designDataUri, brandGuidelines, query } = await req.json();

    if (!brandGuidelines || !query) {
      return NextResponse.json({ error: 'Missing required fields', details: 'brandGuidelines and query are required.' }, { status: 400 });
    }

    const result = await brandAssistant({
      designDataUri: designDataUri, // Can be undefined
      brandGuidelines,
      query,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/brand-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to get assistant response', details: errorMessage }, { status: 500 });
  }
}
