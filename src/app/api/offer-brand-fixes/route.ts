
import { offerBrandFixes } from '@/ai/flows/offer-brand-fixes';
import { auth } from '@/lib/auth';
import ProjectModel from '@/models/project';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { designDataUri, brandGuidelines, designContext, projectId } = await req.json();

    if (!designDataUri || !brandGuidelines || !designContext || !projectId) {
      return NextResponse.json({ error: 'Missing required fields', details: 'designDataUri, brandGuidelines, projectId, and designContext are required.' }, { status: 400 });
    }

    // Authorization check for web users. If no session, assume it's the addon.
    if (session?.user) {
        const project = await ProjectModel.findById(projectId);
        if (!project) {
        return NextResponse.json({ error: 'Not Found', details: 'Project not found.' }, { status: 404 });
        }

        const isOwner = project.userId.toString() === session.user.id;
        const isManagerOrAdmin = session.user.role === 'admin' || session.user.role === 'brand_manager';
        if (!isOwner && !isManagerOrAdmin) {
            return NextResponse.json({ error: 'Forbidden', details: 'You do not have permission to offer fixes for this project.' }, { status: 403 });
        }
    } else {
       console.log('No session found for offering fixes, assuming add-on request.');
    }


    const result = await offerBrandFixes({
      designDataUri,
      brandGuidelines,
      designContext,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/offer-brand-fixes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to offer brand fixes', details: errorMessage }, { status: 500 });
  }
}
