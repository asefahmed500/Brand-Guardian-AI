
'use client';

import type { ComplianceResult, GeneratedTemplate, ProjectWithDetails, User } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { BrandSetupPanel } from './brand-setup-panel';
import { BrandTemplateGeneratorPanel } from './brand-template-generator-panel';
import { BrandAssetLibraryPanel } from './brand-asset-library-panel';
import { DesignCompliancePanel } from './design-compliance-panel';
import { PersonalAnalyticsPanel } from './personal-analytics-panel';
import { DesignHistoryPanel } from './design-history-panel';

interface BrandGuardianDashboardProps {
  project: ProjectWithDetails;
  onAnalyzeDesign: (designDataUri: string, designContext: string) => Promise<void>;
  isAnalyzingDesign: boolean;
  complianceResult: ComplianceResult | null;
  onGenerateTemplates: () => Promise<void>;
  isGeneratingTemplates: boolean;
  generatedTemplates: GeneratedTemplate[] | null;
}

export default function BrandGuardianDashboard({ 
    project, 
    onAnalyzeDesign,
    isAnalyzingDesign,
    complianceResult,
    onGenerateTemplates,
    isGeneratingTemplates,
    generatedTemplates,
}: BrandGuardianDashboardProps) {
  const { data: session } = useSession();
  
  const brandFingerprint = project.brandFingerprint;
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  
  const userDesigns = project.designs.filter(design => design.userId === userId);

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DesignCompliancePanel 
            onAnalyze={onAnalyzeDesign}
            isAnalyzing={isAnalyzingDesign}
            complianceResult={complianceResult}
            brandFingerprint={brandFingerprint}
            designs={project.designs}
          />
          {userDesigns && userDesigns.length > 0 && <DesignHistoryPanel designs={userDesigns} />}
        </div>
        <div className="lg:col-span-1 space-y-6">
            <BrandSetupPanel 
              project={project}
            />
            {userDesigns && userDesigns.length > 0 && <PersonalAnalyticsPanel designs={userDesigns} />}
            <BrandAssetLibraryPanel
              project={project}
            />
            <BrandTemplateGeneratorPanel 
              brandFingerprint={brandFingerprint}
              onGenerate={onGenerateTemplates}
              isGenerating={isGeneratingTemplates}
              templates={generatedTemplates}
            />
        </div>
      </div>
    </div>
  );
}
