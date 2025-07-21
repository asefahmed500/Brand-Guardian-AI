
import { extractColorsFromImage } from '@/ai/flows/extract-colors-from-image';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', details: 'You must be logged in to perform this action.' }, { status: 401 });
  }

  try {
    const { imageDataUri, brandFingerprint } = await req.json();

    if (!imageDataUri || !brandFingerprint) {
      return NextResponse.json({ error: 'Missing required fields', details: 'imageDataUri and brandFingerprint are required.' }, { status: 400 });
    }

    const result = await extractColorsFromImage({ imageDataUri, brandFingerprint });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/extract-colors-from-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to extract colors', details: errorMessage }, { status: 500 });
  }
}
