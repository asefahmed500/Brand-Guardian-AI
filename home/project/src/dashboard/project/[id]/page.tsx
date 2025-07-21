'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { handleDesignAnalysis, handleGenerateTemplates } from '@/lib/actions';
import type { ComplianceResult, GeneratedTemplate, ProjectWithDetails } from '@/lib/types';
import BrandGuardianDashboard from "@/components/brand-guardian-dashboard";
import { BrandManagerDashboard } from "@/components/brand-manager-dashboard";
import { getProjectDetails } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, Microscope, Brush, PencilRuler } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AISketchpad = dynamic(() => import('@/components/ai-sketchpad').then(mod => mod.AISketchpad), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
});


export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [generatedTemplates, setGeneratedTemplates] = useState<GeneratedTemplate[] | null>(null);
  const [isAnalyzingDesign, setIsAnalyzingDesign] = useState(false);
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false);
  
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === 'authenticated' && projectId) {
      const userId = session.user.id;
      const userRole = session.user.role;

      getProjectDetails(projectId, userId, userRole)
        .then(data => {
          if (data) {
            setProject(data);
          } else {
            setError("Project not found or you don't have permission to view it.");
          }
        })
        .catch(() => setError("Failed to load project details."))
        .finally(() => setIsLoading(false));
    }
    if(status === 'unauthenticated'){
      router.push('/login');
    }
  }, [status, projectId, session, router]);
  
  const refreshProjectData = async () => {
    if (!project || !session) return;
    const data = await getProjectDetails(project._id, session.user.id, session.user.role);
    if (data) {
        setProject(data);
    }
  };

  const onAnalyzeDesign = async (designDataUri: string, designContext: string) => {
    if (!project?.brandFingerprint) {
      toast({
        variant: 'destructive',
        title: 'Cannot Analyze',
        description: 'Project is missing a brand fingerprint.',
      });
      return;
    }
    
    // If the call is just to reset the UI, do it without showing the loader
    if (!designDataUri && !designContext) {
        setComplianceResult(null);
        return;
    }

    setIsAnalyzingDesign(true);
    setComplianceResult(null);
    try {
      const result = await handleDesignAnalysis(designDataUri, project.brandFingerprint, designContext, project._id);
      setComplianceResult(result);
      await refreshProjectData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsAnalyzingDesign(false);
    }
  };

  const onGenerateTemplates = async () => {
    if (!project?.brandFingerprint) {
      toast({
        variant: 'destructive',
        title: 'Cannot Generate',
        description: 'Project is missing a brand fingerprint.',
      });
      return;
    }
    setIsGeneratingTemplates(true);
    setGeneratedTemplates(null);
    try {
      const result = await handleGenerateTemplates(project.brandFingerprint);
      setGeneratedTemplates(result.templates);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Template Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsGeneratingTemplates(false);
    }
  };

  if (isLoading || status === 'loading') {
     return (
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" />
                <p>Loading Project...</p>
            </div>
        </div>
    );
  }

  if (error || !project) {
    return (
        <Card className="m-auto mt-16 max-w-lg text-center">
            <CardHeader>
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle className="mt-4">Project Not Found</CardTitle>
                <CardDescription>
                    {error || 'The project you are looking for does not exist or you do not have permission to view it.'}
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }
  
  const userRole = session?.user?.role;
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'brand_manager';
  const hasBrandFingerprint = !!project.brandFingerprint;
  
  const TABS = [
    { value: "overview", label: isManagerOrAdmin ? 'Manager Overview' : 'Designer Dashboard', icon: Microscope },
    { value: "studio", label: 'Creative Studio', icon: Brush, requiresFingerprint: true },
    { value: "sketchpad", label: 'AI Sketchpad', icon: PencilRuler, requiresFingerprint: true },
  ];

  const commonProps = {
    project,
    onAnalyzeDesign,
    isAnalyzingDesign,
    complianceResult,
    onGenerateTemplates,
    isGeneratingTemplates,
    generatedTemplates,
  };

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
            <p className="text-muted-foreground">Analyze designs, generate assets, and stay on-brand.</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={cn("grid w-full", hasBrandFingerprint ? "grid-cols-3" : "grid-cols-1")}>
              {TABS.map(tab => (
                (!tab.requiresFingerprint || hasBrandFingerprint) && (
                  <TabsTrigger value={tab.value} key={tab.value}>
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                )
              ))}
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              {status === 'loading' ? (
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin" />
                    <p>Loading Dashboard...</p>
                </div>
              ) : isManagerOrAdmin 
                  ? <BrandManagerDashboard {...commonProps} />
                  : <BrandGuardianDashboard {...commonProps} />
              }
            </TabsContent>

            {hasBrandFingerprint && (
              <>
                <TabsContent value="studio" className="mt-6">
                   <CreativeStudio project={project} />
                </TabsContent>
                <TabsContent value="sketchpad" className="mt-6">
                   <AISketchpad project={project}/>
                </TabsContent>
              </>
            )}
        </Tabs>
    </div>
  );
}