
'use server';

import { analyzeBrandAssets, AnalyzeBrandAssetsInput } from '@/ai/flows/analyze-brand-assets';
import { generateComplianceScore } from '@/ai/flows/generate-compliance-score';
import { offerBrandFixes, OfferBrandFixesOutput } from '@/ai/flows/offer-brand-fixes';
import { applyBrandFixes, ApplyBrandFixesOutput } from '@/ai/flows/apply-brand-fixes';
import { generateBrandTemplates, GenerateBrandTemplatesOutput } from '@/ai/flows/generate-brand-templates';
import { tagBrandAsset } from '@/ai/flows/tag-brand-asset';
import { sendPasswordResetEmail } from '@/ai/flows/send-password-reset-email';
import { highlightDesignDifferences, HighlightDesignDifferencesOutput } from '@/ai/flows/highlight-design-differences';
import { detectGuidelineConflicts, DetectGuidelineConflictsOutput } from '@/ai/flows/detect-guideline-conflicts';
import { extractColorsFromImage, ExtractColorsFromImageOutput } from '@/ai/flows/extract-colors-from-image';
import { generateLayoutSuggestion, GenerateLayoutSuggestionOutput } from '@/ai/flows/generate-layout-suggestion';
import { promptToDesign, PromptToDesignOutput } from '@/ai/flows/prompt-to-design';
import { enhanceSketch, EnhanceSketchOutput } from '@/ai/flows/enhance-sketch';
import { colorizeSketch, ColorizeSketchOutput } from '@/ai/flows/colorize-sketch';
import type { BrandFingerprint, ComplianceResult, Project, ProjectWithDetails, User as UserType, Asset as AssetType, Design as DesignType } from '@/lib/types';
import connectDB from './mongodb';
import ProjectModel from '@/models/project';
import DesignModel from '@/models/design';
import AssetModel from '@/models/asset';
import UserModel from '@/models/user';
import { auth } from './auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
  image: z.string().optional(),
});

export async function handleSignUp(credentials: z.infer<typeof SignUpSchema>): Promise<UserType> {
    await connectDB();
    const validatedCredentials = SignUpSchema.safeParse(credentials);
    if (!validatedCredentials.success) {
        throw new Error('Invalid credentials');
    }
    
    const { email, password, name, image } = validatedCredentials.data;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new UserModel({ 
        email, 
        password: hashedPassword, 
        name, 
        image, 
        role: 'user',
        subscriptionPlan: 'free',
        analysisLimit: 5 
    });

    await newUser.save();

    return JSON.parse(JSON.stringify(newUser));
}

export async function handleForgotPassword(email: string): Promise<void> {
    await connectDB();
    const user = await UserModel.findOne({ email });

    if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = new Date(passwordResetExpires);
        await user.save();

        const resetURL = `${process.env.AUTH_URL || 'http://localhost:9002'}/reset-password?token=${resetToken}`;
        
        await sendPasswordResetEmail({ email, resetLink: resetURL });
    }
}


export async function handleResetPassword(token: string, newPassword: string):Promise<void> {
    if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await connectDB();
    const user = await UserModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error('Token is invalid or has expired.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockoutExpires = undefined;

    await user.save();
}

export async function handleCreateProject(
    input: AnalyzeBrandAssetsInput & { name: string }
): Promise<Project> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('You must be logged in to create a project.');
    }

    if (!input.logoDataUri) {
        throw new Error('Logo image is required.');
    }
    if (!input.brandDescription?.trim()) {
        throw new Error('Brand description is required.');
    }
    if (!input.name?.trim()) {
        throw new Error('Project name is required.');
    }

    try {
        await connectDB();
        const brandFingerprint = await analyzeBrandAssets({
            brandDescription: input.brandDescription,
            logoDataUri: input.logoDataUri,
        });
        
        const newProject = new ProjectModel({
            name: input.name,
            userId,
            brandDescription: input.brandDescription,
            logoDataUri: input.logoDataUri,
            brandFingerprint
        });
        
        await newProject.save();

        revalidatePath('/dashboard');
        return JSON.parse(JSON.stringify(newProject));

    } catch (error) {
        console.error('Error in handleCreateProject:', error);
        throw new Error('Failed to create project due to a server error. Please try again.');
    }
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
    try {
        await connectDB();
        const projects = await ProjectModel.find({ userId }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(projects));
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

export async function getProjectDetails(
    projectId: string, 
    userId: string,
    userRole?: 'user' | 'brand_manager' | 'admin'
): Promise<ProjectWithDetails | null> {
    try {
        await connectDB();
        const project = await ProjectModel.findById(projectId);
        if (!project) return null;

        const isOwner = project.userId.toString() === userId;
        const isManagerOrAdmin = userRole === 'admin' || userRole === 'brand_manager';
        
        // A regular user can only see their own projects.
        // A manager or admin can see any project.
        if (!isOwner && !isManagerOrAdmin) {
            return null; // Forbidden
        }

        const designs = await DesignModel.find({ projectId }).sort({ createdAt: -1 });
        const assets = await AssetModel.find({ projectId }).sort({ createdAt: -1 });
        
        const projectObject = project.toObject();
        projectObject.designs = designs.map(d => d.toObject());
        projectObject.assets = assets.map(a => a.toObject());

        return JSON.parse(JSON.stringify(projectObject));

    } catch (error) {
        console.error('Error fetching project details:', error);
        return null;
    }
}


export async function handleUpdateProject(
    projectId: string,
    updateData: { name: string; brandDescription: string; brandFingerprint: BrandFingerprint }
): Promise<Project> {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
        throw new Error('You must be logged in to update a project.');
    }
    
    await connectDB();
    const project = await ProjectModel.findById(projectId);

    if (!project) {
        throw new Error('Project not found.');
    }

    const isOwner = project.userId.toString() === user.id;
    const isManagerOrAdmin = user.role === 'admin' || user.role === 'brand_manager';

    if (!isOwner && !isManagerOrAdmin) {
        throw new Error('You do not have permission to update this project.');
    }

    try {
        // A project owner, manager, or admin can update the name and description.
        project.name = updateData.name;
        project.brandDescription = updateData.brandDescription;

        // Only allow managers or admins to update the core brand fingerprint
        if (isManagerOrAdmin) {
            project.brandFingerprint = {
                primaryColors: updateData.brandFingerprint.primaryColors,
                secondaryColors: updateData.brandFingerprint.secondaryColors,
                typographyStyle: updateData.brandFingerprint.typographyStyle,
                logoPlacementPreferences: updateData.brandFingerprint.logoPlacementPreferences,
                overallDesignAesthetic: updateData.brandFingerprint.overallDesignAesthetic,
            };
        }
        
        await project.save();

        revalidatePath(`/dashboard`);
        revalidatePath(`/dashboard/project/${projectId}`);
        return JSON.parse(JSON.stringify(project));

    } catch (error) {
        console.error('Error in handleUpdateProject:', error);
        throw new Error('Failed to update project due to a server error.');
    }
}

export async function handleDeleteProject(projectId: string): Promise<{ success: boolean }> {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
        throw new Error('You must be logged in to delete a project.');
    }

    await connectDB();
    const project = await ProjectModel.findById(projectId);

    if (!project) {
        throw new Error('Project not found.');
    }

    const isOwner = project.userId.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to delete this project.');
    }

    try {
        // Delete all associated designs and assets first
        await DesignModel.deleteMany({ projectId });
        await AssetModel.deleteMany({ projectId });

        // Then delete the project itself
        await ProjectModel.findByIdAndDelete(projectId);

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error) {
        console.error('Error in handleDeleteProject:', error);
        throw new Error('Failed to delete project due to a server error.');
    }
}


export async function handleDesignAnalysis(
  designDataUri: string,
  brandFingerprint: BrandFingerprint,
  designContext: string,
  projectId: string,
): Promise<ComplianceResult> {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to analyze a design.');
    }
    
    await connectDB();
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found.');
    }
    
    if (user.analysisLimit !== -1 && user.monthlyAnalysisCount >= user.analysisLimit) {
        throw new Error('You have reached your monthly analysis limit. Please upgrade your plan.');
    }

    if (!designDataUri) {
        throw new Error('Design image is required.');
    }
    if (!brandFingerprint) {
        throw new Error('Brand fingerprint is not available. Please analyze your brand first.');
    }

  try {
    const brandFingerprintString = JSON.stringify(brandFingerprint);

    const [complianceScoreResult, fixesResult] = await Promise.all([
      generateComplianceScore({
        designDataUri,
        brandFingerprint: brandFingerprintString,
        designContext,
      }),
      offerBrandFixes({
        designDataUri,
        brandGuidelines: brandFingerprintString,
        designContext,
      }),
    ]);
    
    const newDesign = new DesignModel({
      projectId,
      userId,
      userName: session?.user?.name || session?.user?.email,
      originalImageUrl: designDataUri,
      designContext,
      complianceScore: complianceScoreResult.complianceScore,
      feedback: complianceScoreResult.feedback,
      suggestedFixes: fixesResult.fixes.map(fix => ({ description: fix.description, type: fix.type })),
      status: 'pending',
    });
    
    await newDesign.save();
    
    // --- Badge Logic ---
    const designCount = await DesignModel.countDocuments({ userId });
    if (designCount >= 5 && !user.achievements.includes('first-5-designs')) {
        user.achievements.push('first-5-designs');
    }

    if (complianceScoreResult.complianceScore >= 90) {
        user.highScoreStreak = (user.highScoreStreak || 0) + 1;
        if (user.highScoreStreak >= 3 && !user.achievements.includes('high-scorer-streak')) {
            user.achievements.push('high-scorer-streak');
        }
    } else {
        user.highScoreStreak = 0;
    }
    // --- End Badge Logic ---

    user.monthlyAnalysisCount += 1;
    await user.save();
    
    revalidatePath(`/dashboard/project/${projectId}`);
    revalidatePath(`/dashboard/settings`);

    const complianceResult: ComplianceResult = {
        designId: newDesign._id.toString(),
        complianceScore: complianceScoreResult.complianceScore,
        feedback: complianceScoreResult.feedback,
        fixes: fixesResult.fixes,
    }

    return complianceResult;

  } catch (error) {
    console.error('Error in handleDesignAnalysis:', error);
    if (error instanceof Error && error.message.includes('monthly analysis limit')) {
        throw error;
    }
    throw new Error('Failed to analyze design due to a server error. Please try again.');
  }
}


export async function handleApplyFixes(
  designDataUri: string,
  brandFingerprint: BrandFingerprint,
  fixes: OfferBrandFixesOutput['fixes']
): Promise<ApplyBrandFixesOutput> {
  const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in to apply fixes.');
    }
  if (!designDataUri) {
    throw new Error('Original design image is required.');
  }
  if (!brandFingerprint) {
    throw new Error('Brand fingerprint is not available.');
  }
  if (fixes.length === 0) {
    throw new Error('At least one fix must be provided.');
  }

  try {
    const brandGuidelines = JSON.stringify(brandFingerprint);
    const fixDescriptions = fixes.map(fix => fix.description);
    
    const result = await applyBrandFixes({
      designDataUri,
      brandGuidelines,
      fixes: fixDescriptions,
    });
    
    // Award badge for using the feature
    const user = await UserModel.findById(userId);
    if (user && !user.achievements.includes('one-click-fixer')) {
        user.achievements.push('one-click-fixer');
        await user.save();
        revalidatePath('/dashboard/settings');
    }

    return result;
  } catch (error) {
    console.error('Error in handleApplyFixes:', error);
    throw new Error('Failed to apply fixes due to a server error. Please try again.');
  }
}

export async function handleHighlightDifferences(
  originalDesignDataUri: string,
  fixedDesignDataUri: string
): Promise<HighlightDesignDifferencesOutput> {
   const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to do this.');
    }
    try {
        const result = await highlightDesignDifferences({
            originalDesignDataUri,
            fixedDesignDataUri,
        });
        return result;
    } catch(error) {
        console.error('Error in handleHighlightDifferences:', error);
        throw new Error('Failed to highlight differences due to a server error.');
    }
}

export async function handleDetectConflicts(
  brandFingerprint: BrandFingerprint
): Promise<DetectGuidelineConflictsOutput> {
    const session = await auth();
    const user = session?.user;
    if (!user || (user.role !== 'admin' && user.role !== 'brand_manager')) {
        throw new Error('You do not have permission to perform this action.');
    }
     try {
        const brandFingerprintString = JSON.stringify(brandFingerprint);
        const result = await detectGuidelineConflicts({
            brandFingerprint: brandFingerprintString,
        });
        return result;
    } catch(error) {
        console.error('Error in handleDetectConflicts:', error);
        throw new Error('Failed to detect conflicts due to a server error.');
    }
}


export async function handleGenerateTemplates(
  brandFingerprint: BrandFingerprint
): Promise<GenerateBrandTemplatesOutput> {
  const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be logged in to generate templates.');
    }
  if (!brandFingerprint) {
    throw new Error('Brand fingerprint is not available.');
  }

  try {
    const brandGuidelines = JSON.stringify(brandFingerprint);
    const result = await generateBrandTemplates({
      brandGuidelines,
      templateCount: 3,
    });
    return result;
  } catch (error)
  {
    console.error('Error in handleGenerateTemplates:', error);
    throw new Error('Failed to generate templates due to a server error. Please try again.');
  }
}

export async function getAllUsers(): Promise<UserType[]> {
    const session = await auth();
    const user = session?.user;

    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        await connectDB();
        const users = await UserModel.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw new Error('Failed to fetch users due to a server error.');
    }
}

export async function handleCreateAsset(
    input: { projectId: string; name: string; dataUri: string }
): Promise<AssetType> {
    const session = await auth();
    const user = session?.user;
    if (!user?.id) {
        throw new Error('You must be logged in to create an asset.');
    }
    
    if (user.role !== 'admin' && user.role !== 'brand_manager') {
        throw new Error('You do not have permission to upload assets.');
    }
    
    try {
        await connectDB();
        const aiTags = await tagBrandAsset({
            assetDataUri: input.dataUri,
            assetName: input.name,
        });

        const newAsset = new AssetModel({
            projectId: input.projectId,
            name: input.name,
            dataUri: input.dataUri,
            type: aiTags.type,
            tags: aiTags.tags,
            aiSummary: aiTags.aiSummary,
        });

        await newAsset.save();

        revalidatePath(`/dashboard/project/${input.projectId}`);
        return JSON.parse(JSON.stringify(newAsset));

    } catch (error) {
        console.error('Error in handleCreateAsset:', error);
        throw new Error('Failed to create asset due to a server error.');
    }
}

export async function getUserSettings(): Promise<UserType | null> {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return null;
    }

    try {
        await connectDB();
        const user = await UserModel.findById(userId).select('-password');
        if (!user) return null;
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return null;
    }
}

const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty.'),
});

export async function handleUpdateUser(updateData: z.infer<typeof UpdateUserSchema>) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('You must be logged in.');
    }

    const validatedData = UpdateUserSchema.safeParse(updateData);
    if (!validatedData.success) {
        throw new Error('Invalid data provided.');
    }

    try {
        await connectDB();
        await UserModel.findByIdAndUpdate(userId, { name: validatedData.data.name });
        revalidatePath('/dashboard/settings');
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update your profile.');
    }
}

const UpdateUserByAdminSchema = z.object({
    userId: z.string(),
    role: z.enum(['user', 'brand_manager', 'admin']),
    subscriptionPlan: z.enum(['free', 'pro', 'enterprise']),
});

export async function handleUpdateUserByAdmin(updateData: z.infer<typeof UpdateUserByAdminSchema>) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const validatedData = UpdateUserByAdminSchema.safeParse(updateData);
    if (!validatedData.success) {
        throw new Error('Invalid data provided.');
    }

    try {
        await connectDB();
        const { userId, role, subscriptionPlan } = validatedData.data;
        const userToUpdate = await UserModel.findById(userId);
        if (!userToUpdate) {
            throw new Error('User not found.');
        }
        
        userToUpdate.role = role;
        userToUpdate.subscriptionPlan = subscriptionPlan;

        await userToUpdate.save();

        revalidatePath('/admin');
    } catch (error) {
        console.error('Error updating user by admin:', error);
        throw new Error('Failed to update user.');
    }
}

const UpdateDesignStatusSchema = z.object({
    designId: z.string(),
    status: z.enum(['approved', 'rejected']),
    managerFeedback: z.string().optional(),
});

export async function handleUpdateDesignStatus(updateData: z.infer<typeof UpdateDesignStatusSchema>) {
    const session = await auth();
    const user = session?.user;
    if (!user || (user.role !== 'admin' && user.role !== 'brand_manager')) {
        throw new Error('You do not have permission to perform this action.');
    }

    const validatedData = UpdateDesignStatusSchema.safeParse(updateData);
    if (!validatedData.success) {
        throw new Error('Invalid data provided.');
    }
    
    if (validatedData.data.status === 'rejected' && !validatedData.data.managerFeedback) {
        throw new Error('Feedback is required when rejecting a design.');
    }
    
    try {
        await connectDB();
        const { designId, status, managerFeedback } = validatedData.data;
        const designToUpdate = await DesignModel.findById(designId);
        
        if (!designToUpdate) {
            throw new Error('Design not found.');
        }
        
        designToUpdate.status = status;
        if (managerFeedback) {
            designToUpdate.managerFeedback = managerFeedback;
        }
        
        await designToUpdate.save();
        
        revalidatePath(`/dashboard/project/${designToUpdate.projectId}`);
        revalidatePath(`/admin`);


    } catch (error) {
        console.error('Error updating design status:', error);
        throw new Error('Failed to update design status.');
    }
}


export async function handleExtractColors(
    imageDataUri: string,
    brandFingerprint: BrandFingerprint
): Promise<ExtractColorsFromImageOutput> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Authentication required.');

    try {
        const brandFingerprintString = JSON.stringify(brandFingerprint);
        return await extractColorsFromImage({ imageDataUri, brandFingerprint: brandFingerprintString });
    } catch(e) {
        console.error("Error extracting colors:", e);
        throw new Error("Failed to extract colors from image.");
    }
}

export async function handleGenerateLayout(
    brandFingerprint: BrandFingerprint,
    headline?: string,
    bodyText?: string,
    imagePrompt?: string
): Promise<GenerateLayoutSuggestionOutput> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Authentication required.');

    try {
        const brandFingerprintString = JSON.stringify(brandFingerprint);
        return await generateLayoutSuggestion({
            brandFingerprint: brandFingerprintString,
            headline,
            bodyText,
            imagePrompt,
        });
    } catch (e) {
        console.error("Error generating layout:", e);
        throw new Error("Failed to generate layout suggestion.");
    }
}

export async function handlePromptToDesign(
    brandFingerprint: BrandFingerprint,
    prompt: string
): Promise<PromptToDesignOutput> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Authentication required.');

    try {
        const brandFingerprintString = JSON.stringify(brandFingerprint);
        return await promptToDesign({
            brandFingerprint: brandFingerprintString,
            prompt,
        });
    } catch (e) {
        console.error("Error generating design from prompt:", e);
        throw new Error("Failed to generate design from prompt.");
    }
}

const AddNoteSchema = z.object({
  designId: z.string(),
  notes: z.string(),
});

export async function handleAddNoteToDesign(data: z.infer<typeof AddNoteSchema>) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('Authentication required.');
    }
    
    const validatedData = AddNoteSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid data provided.');
    }
    
    await connectDB();
    const design = await DesignModel.findById(validatedData.data.designId);
    
    if (!design) {
        throw new Error('Design not found.');
    }
    
    if (design.userId.toString() !== userId) {
        throw new Error('You do not have permission to add a note to this design.');
    }
    
    design.notes = validatedData.data.notes;
    await design.save();
    
    revalidatePath(`/dashboard/project/${design.projectId}`);
}

const TagDesignSchema = z.object({
  designId: z.string(),
  tags: z.array(z.string()),
});

export async function handleTagDesign(data: z.infer<typeof TagDesignSchema>) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('Authentication required.');
    }
    
    const validatedData = TagDesignSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid data provided.');
    }
    
    await connectDB();
    const design = await DesignModel.findById(validatedData.data.designId);
    
    if (!design) {
        throw new Error('Design not found.');
    }
    
    if (design.userId.toString() !== userId) {
        throw new Error('You do not have permission to tag this design.');
    }
    
    design.tags = validatedData.data.tags;
    await design.save();
    
    revalidatePath(`/dashboard/project/${design.projectId}`);
}

const PeerFeedbackRequestSchema = z.object({
    designId: z.string(),
    requested: z.boolean(),
});

export async function handlePeerFeedbackRequest(data: z.infer<typeof PeerFeedbackRequestSchema>) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error('Authentication required.');
    }
    
    const validatedData = PeerFeedbackRequestSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid data provided.');
    }
    
    await connectDB();
    const design = await DesignModel.findById(validatedData.data.designId);
    
    if (!design) {
        throw new Error('Design not found.');
    }
    
    if (design.userId.toString() !== userId) {
        throw new Error('You do not have permission to modify this design.');
    }
    
    design.peerFeedbackRequested = validatedData.data.requested;
    await design.save();
    
    revalidatePath(`/dashboard/project/${design.projectId}`);
}

export async function handleEnhanceSketch(
    data: { sketchDataUri: string; brandFingerprint: string; prompt?: string }
): Promise<EnhanceSketchOutput> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Authentication required.');
    try {
        return await enhanceSketch(data);
    } catch (e) {
        console.error("Error enhancing sketch:", e);
        throw new Error("Failed to enhance sketch.");
    }
}

export async function handleColorizeSketch(
    data: { sketchDataUri: string; brandFingerprint: string }
): Promise<ColorizeSketchOutput> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Authentication required.');
    try {
        return await colorizeSketch(data);
    } catch (e) {
        console.error("Error colorizing sketch:", e);
        throw new Error("Failed to colorize sketch.");
    }
}
