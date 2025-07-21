
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Palette, Type, LayoutGrid, Pin, Save, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import type { BrandFingerprint, GuidelineConflictsResult, ProjectWithDetails } from '@/lib/types';
import { handleUpdateProject, handleDetectConflicts } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useSession } from 'next-auth/react';

interface BrandSetupPanelProps {
  project: ProjectWithDetails;
}

const ColorInput = ({ label, value, onChange, disabled }: { label: string, value: string[], onChange: (colors: string[]) => void, disabled: boolean }) => {
  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...value];
    newColors[index] = newColor;
    onChange(newColors);
  };
  return (
    <div>
      <h4 className="font-semibold flex items-center gap-2 mb-2"><Palette size={16} /> {label}</h4>
      <div className="flex flex-wrap gap-2">
        {value.map((color, index) => (
          <Input 
            key={`${label}-${index}-${color}`} 
            type="color" 
            value={color}
            onChange={(e) => handleColorChange(index, e.target.value)}
            className="p-1 h-8 w-24 rounded-md"
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};


export function BrandSetupPanel({ project }: BrandSetupPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [conflictResult, setConflictResult] = useState<GuidelineConflictsResult | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  const [projectName, setProjectName] = useState(project.name);
  const [brandDescription, setBrandDescription] = useState(project.brandDescription);
  const [brandFingerprint, setBrandFingerprint] = useState<BrandFingerprint>(project.brandFingerprint);
  
  useEffect(() => {
    setProjectName(project.name);
    setBrandDescription(project.brandDescription);
    setBrandFingerprint(project.brandFingerprint);
  }, [project]);
  
  const userRole = session?.user?.role;
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'brand_manager';
  const isOwner = session?.user?.id === project.userId;
  const canEditGuidelines = isManagerOrAdmin;
  const canEditProjectInfo = isOwner || isManagerOrAdmin;

  const onDetectConflicts = async () => {
    if (!canEditGuidelines) return;
    setIsCheckingConflicts(true);
    setConflictResult(null);
    try {
        const result = await handleDetectConflicts(brandFingerprint);
        setConflictResult(result);
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Conflict Check Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsCheckingConflicts(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canEditProjectInfo) return;

    setIsUpdating(true);
    try {
      await handleUpdateProject(project._id, {
        name: projectName,
        brandDescription,
        brandFingerprint
      });
      toast({
        title: 'Project Updated',
        description: 'Brand guidelines have been saved.',
      });
      router.refresh();
      setConflictResult(null); // Clear conflicts after saving
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  Brand Guidelines
                </CardTitle>
                <CardDescription>
                    {canEditProjectInfo ? 'Modify your brand identity.' : 'Your brand identity summary.'}
                </CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            {conflictResult && (
                conflictResult.conflicts.length > 0 ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Potential Conflicts Found</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                {conflictResult.conflicts.map((c, i) => <li key={i}>{c.description}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="default" className="bg-accent/30 border-accent">
                         <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle>No Conflicts Found</AlertTitle>
                        <AlertDescription>
                           These guidelines look consistent and follow best practices.
                        </AlertDescription>
                    </Alert>
                )
            )}
            
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} disabled={!canEditProjectInfo} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="brand-description-textarea">Brand Description</Label>
                <Textarea id="brand-description-textarea" value={brandDescription} onChange={(e) => setBrandDescription(e.target.value)} disabled={!canEditProjectInfo} />
            </div>
            
            <ColorInput
                label="Primary Colors"
                value={brandFingerprint.primaryColors}
                onChange={(colors) => setBrandFingerprint({...brandFingerprint, primaryColors: colors})}
                disabled={!canEditGuidelines}
            />

            <ColorInput
                label="Secondary Colors"
                value={brandFingerprint.secondaryColors}
                onChange={(colors) => setBrandFingerprint({...brandFingerprint, secondaryColors: colors})}
                disabled={!canEditGuidelines}
            />
            
            <div className="space-y-2">
                <Label htmlFor="typography-style" className="font-semibold flex items-center gap-2"><Type size={16} /> Typography</Label>
                <Textarea id="typography-style" value={brandFingerprint.typographyStyle} onChange={(e) => setBrandFingerprint({...brandFingerprint, typographyStyle: e.target.value})} disabled={!canEditGuidelines} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="logo-placement" className="font-semibold flex items-center gap-2"><Pin size={16} /> Logo Placement</Label>
                <Textarea id="logo-placement" value={brandFingerprint.logoPlacementPreferences} onChange={(e) => setBrandFingerprint({...brandFingerprint, logoPlacementPreferences: e.target.value})} disabled={!canEditGuidelines} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="design-aesthetic" className="font-semibold flex items-center gap-2"><LayoutGrid size={16} /> Design Aesthetic</Label>
                <Textarea id="design-aesthetic" value={brandFingerprint.overallDesignAesthetic} onChange={(e) => setBrandFingerprint({...brandFingerprint, overallDesignAesthetic: e.target.value})} disabled={!canEditGuidelines} />
            </div>
            
        </CardContent>
        {canEditProjectInfo && (
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                 <Button type="button" variant="outline" className="w-full" onClick={onDetectConflicts} disabled={isCheckingConflicts || !canEditGuidelines}>
                    {isCheckingConflicts ? <Loader2 className="animate-spin mr-2" /> : <ShieldAlert className="mr-2" />}
                    Check for Conflicts
                </Button>
                 <Button type="submit" className="w-full" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                    Save Changes
                </Button>
            </CardFooter>
        )}
      </form>
    </Card>
  );
}

    