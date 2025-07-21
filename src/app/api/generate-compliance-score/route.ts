
import { generateComplianceScore } from '@/ai/flows/generate-compliance-score';
import { auth } from '@/lib/auth';
import ProjectModel from '@/models/project';
import UserModel from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { designDataUri, brandFingerprint, designContext, projectId } = await req.json();

    if (!designDataUri || !brandFingerprint || !designContext || !projectId) {
      return NextResponse.json({ error: 'Missing required fields', details: 'designDataUri, brandFingerprint, projectId, and designContext are required.' }, { status: 400 });
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
            return NextResponse.json({ error: 'Forbidden', details: 'You do not have permission to analyze designs for this project.' }, { status: 403 });
        }
        
        // Update usage count only for logged-in web users
        const user = await UserModel.findById(session.user.id);
        if (user) {
            user.monthlyAnalysisCount = (user.monthlyAnalysisCount || 0) + 1;
            await user.save();
        }
    } else {
        console.log('No session found for compliance score, assuming add-on request.');
    }


    const result = await generateComplianceScore({
      designDataUri,
      brandFingerprint,
      designContext,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/generate-compliance-score:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate compliance score', details: errorMessage }, { status: 500 });
  }
}
