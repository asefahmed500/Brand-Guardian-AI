
import type { GenerateComplianceScoreInput, GenerateComplianceScoreOutput } from "@/ai/flows/generate-compliance-score";
import type { AnalyzeBrandAssetsOutput } from "@/ai/flows/analyze-brand-assets";
import type { OfferBrandFixesOutput } from "@/ai/flows/offer-brand-fixes";
import type { ApplyBrandFixesOutput } from "@/ai/flows/apply-brand-fixes";
import type { GenerateBrandTemplatesOutput } from "@/ai/flows/generate-brand-templates";
import type { HighlightDesignDifferencesOutput } from "@/ai/flows/highlight-design-differences";
import type { DetectGuidelineConflictsOutput } from "@/ai/flows/detect-guideline-conflicts";
import type { ExtractColorsFromImageOutput } from "@/ai/flows/extract-colors-from-image";
import type { GenerateLayoutSuggestionOutput } from "@/ai/flows/generate-layout-suggestion";
import type { PromptToDesignOutput } from "@/ai/flows/prompt-to-design";
import type { EnhanceSketchOutput } from "@/ai/flows/enhance-sketch";
import type { ColorizeSketchOutput } from "@/ai/flows/colorize-sketch";
import type { IUser as UserModelType } from "@/models/user";

// Add role to the user type in next-auth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: 'user' | 'brand_manager' | 'admin';
            subscriptionPlan: 'free' | 'pro' | 'enterprise';
        };
    }
    interface User {
        role?: 'user' | 'brand_manager' | 'admin';
        subscriptionPlan?: 'free' | 'pro' | 'enterprise';
    }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: 'user' | 'brand_manager' | 'admin';
    subscriptionPlan?: 'free' | 'pro' | 'enterprise';
  }
}


export type BrandFingerprint = AnalyzeBrandAssetsOutput;

export type ComplianceResult = GenerateComplianceScoreOutput & OfferBrandFixesOutput & { designId: string };

export type ApplyFixesResult = ApplyBrandFixesOutput;

export type DesignAnalysisInput = Pick<GenerateComplianceScoreInput, 'designDataUri' | 'designContext'>;

export type GeneratedTemplate = GenerateBrandTemplatesOutput['templates'][0];

export type HighlightedResult = HighlightDesignDifferencesOutput;

export type GuidelineConflictsResult = DetectGuidelineConflictsOutput;

export type ColorExtractionResult = ExtractColorsFromImageOutput;

export type LayoutSuggestionResult = GenerateLayoutSuggestionOutput;

export type PromptToDesignResult = PromptToDesignOutput;

export type EnhanceSketchResult = EnhanceSketchOutput;
export type ColorizeSketchResult = ColorizeSketchOutput;

export interface Asset {
    _id: string;
    projectId: string;
    name: string;
    type: 'icon' | 'image' | 'logo';
    dataUri: string;
    tags: string[];
    aiSummary: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    _id: string;
    name: string;
    userId: string;
    brandDescription: string;
    logoDataUri: string;
    brandFingerprint: BrandFingerprint;
    createdAt: string;
    updatedAt: string;
}

export interface Design {
    _id: string;
    projectId: string;
    userId: string;
    userName?: string;
    originalImageUrl: string;
    designContext: string;
    complianceScore: number;
    feedback: string;
    suggestedFixes: { description: string, type: string }[];
    status: 'pending' | 'approved' | 'rejected';
    managerFeedback?: string;
    notes?: string;
    tags: string[];
    peerFeedbackRequested: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectWithDetails extends Project {
    designs: Design[];
    assets: Asset[];
}

// Re-exporting IUser from models as a plain object for use in client components
export type User = {
    _id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: 'user' | 'brand_manager' | 'admin';
    subscriptionPlan: 'free' | 'pro' | 'enterprise';
    monthlyAnalysisCount: number;
    analysisLimit: number;
    createdAt: string;
    updatedAt: string;
    stripeCustomerId?: string;
    achievements: string[];
    highScoreStreak: number;
};
