
import { highlightDesignDifferences } from '@/ai/flows/highlight-design-differences';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
  }

  try {
    const { originalDesignDataUri, fixedDesignDataUri } = await req.json();

    if (!originalDesignDataUri || !fixedDesignDataUri) {
      return NextResponse.json({ error: 'Missing required fields', details: 'Both original and fixed design data URIs are required.' }, { status: 400 });
    }

    const result = await highlightDesignDifferences({
      originalDesignDataUri,
      fixedDesignDataUri,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/highlight-design-differences:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to highlight differences', details: errorMessage }, { status: 500 });
  }
}
