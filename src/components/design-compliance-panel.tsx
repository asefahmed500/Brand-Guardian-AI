
'use client';

import { useState, type FormEvent, useRef, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BrandFingerprint, ComplianceResult, Design, HighlightedResult } from '@/lib/types';
import { ComplianceScoreCircle } from './compliance-score-circle';
import { CheckCircle2, MessageCircle, UploadCloud, Wand2, Loader2, Sparkles, RefreshCcw, Download, FileText, PlusCircle, Microscope, Users, X } from 'lucide-react';
import { handleApplyFixes, handleHighlightDifferences, handlePeerFeedbackRequest } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { OfferBrandFixesOutput } from '@/ai/flows/offer-brand-fixes';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Switch } from './ui/switch';

interface DesignCompliancePanelProps {
  onAnalyze: (designDataUri: string, designContext: string) => Promise<void>;
  isAnalyzing: boolean;
  complianceResult: ComplianceResult | null;
  brandFingerprint: BrandFingerprint | null;
  designs: Design[];
}

export function DesignCompliancePanel({ onAnalyze, isAnalyzing, complianceResult, brandFingerprint, designs }: DesignCompliancePanelProps) {
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [designContext, setDesignContext] = useState('Social Media Post');
  const [isApplyingFixes, setIsApplyingFixes] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [applyingFixIndex, setApplyingFixIndex] = useState<number | null>(null);
  
  const [correctedPreviewUri, setCorrectedPreviewUri] = useState<string | null>(null);
  const [highlightedPreviewUri, setHighlightedPreviewUri] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<'corrected' | 'highlighted'>('corrected');
  
  const [isPeerFeedbackRequested, setIsPeerFeedbackRequested] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleReset = () => {
    setDesignFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCorrectedPreviewUri(null);
    setHighlightedPreviewUri(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    // We notify the parent that we are done with the result by calling onAnalyze with empty values
    onAnalyze('', ''); 
  }

  useEffect(() => {
    // This effect ensures that if the parent component resets the complianceResult (e.g., for a new analysis),
    // this component's local state also resets.
    if (!complianceResult) {
      handleReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complianceResult]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDesignFile(file);
      setCorrectedPreviewUri(null);
      setHighlightedPreviewUri(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setDesignFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!designFile) return;

    setCorrectedPreviewUri(null);
    setHighlightedPreviewUri(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      await onAnalyze(dataUri, designContext);
    };
    reader.readAsDataURL(designFile);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const onApplyFixes = async (fixesToApply: OfferBrandFixesOutput['fixes'], index: number | null = null) => {
    if (!designFile || !brandFingerprint || !complianceResult) return;
    
    setApplyingFixIndex(index);
    setIsApplyingFixes(true);
    setCorrectedPreviewUri(null);
    setHighlightedPreviewUri(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
        const dataUri = event.target?.result as string;
        try {
          const result = await handleApplyFixes(dataUri, brandFingerprint, fixesToApply);
          setCorrectedPreviewUri(result.fixedDesignDataUri);
          setActivePreview('corrected');
          toast({
            title: 'Fixes Applied',
            description: 'The AI-corrected preview has been generated.',
          });
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Fix Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
          });
        } finally {
          setIsApplyingFixes(false);
          setApplyingFixIndex(null);
        }
    };
    reader.readAsDataURL(designFile);
  };

  const onHighlightDifferences = async () => {
    if (!previewUrl || !correctedPreviewUri) return;

    setIsHighlighting(true);
    try {
      const result = await handleHighlightDifferences(previewUrl, correctedPreviewUri);
      setHighlightedPreviewUri(result.highlightedDesignDataUri);
      setActivePreview('highlighted');
      toast({
        title: 'Differences Highlighted',
        description: 'The changes between the original and corrected version are now highlighted.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Highlight Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
        setIsHighlighting(false);
    }
  }
  
  const handleDownload = (dataUri: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const onTogglePeerReview = (checked: boolean) => {
    if (!complianceResult?.designId) return;

    startTransition(async () => {
        try {
            await handlePeerFeedbackRequest({ designId: complianceResult.designId, requested: checked });
            setIsPeerFeedbackRequested(checked);
            toast({
                title: 'Peer Review Status Updated',
                description: checked ? 'Your design is now open for peer feedback.' : 'Your design is no longer open for peer feedback.'
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update peer review status.' });
        }
    });
  }

  if (!brandFingerprint) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Wand2 className="h-4 w-4" />
            <AlertTitle>Brand Fingerprint Missing</AlertTitle>
            <AlertDescription>
                Could not find brand guidelines for this project. Please set them up first.
            </AlertDescription>
          </Alert>
        </CardContent>
       </Card>
    );
  }

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Microscope className="text-primary" />
            Analyze New Design
        </CardTitle>
        <CardDescription>Upload your creative work (e.g., a social media post, a flyer) to check its compliance.</CardDescription>
      </CardHeader>
      
      <CardContent className='flex-grow flex flex-col'>
         {!complianceResult && (
            <div className='flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full bg-secondary/30'>
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-sm">
                  <Input id="design-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" ref={fileInputRef} required={!designFile} />
                  
                  {previewUrl ? (
                    <div className="rounded-md border p-2 flex justify-center items-center bg-card relative w-full h-48">
                        <Image src={previewUrl} alt="Design preview" fill sizes="50vw" className="object-contain rounded-md" />
                        <div className="absolute top-1 right-1 flex gap-1 bg-background/50 rounded-full">
                           <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={triggerFileSelect}>
                            <UploadCloud className="h-4 w-4"/>
                            <span className="sr-only">Change image</span>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleRemoveImage}>
                            <X className="h-4 w-4"/>
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                    </div>
                  ) : (
                    <Button id="design-upload-button" type="button" variant="outline" className="w-full bg-background" onClick={triggerFileSelect}>
                      <UploadCloud className="mr-2" />
                      Upload Design
                    </Button>
                  )}

                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="design-context">Design Context</Label>
                    <Select value={designContext} onValueChange={setDesignContext}>
                        <SelectTrigger id="design-context" className="w-full bg-background">
                        <SelectValue placeholder="Select context" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Social Media Post">Social Media Post</SelectItem>
                        <SelectItem value="Business Presentation">Business Presentation</SelectItem>
                        <SelectItem value="Marketing Flyer">Marketing Flyer</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isAnalyzing || !designFile}>
                    {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                    Analyze Now
                  </Button>
              </form>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-8 h-full">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className='text-lg'>AI is analyzing your design...</p>
              <p className='text-sm'>This may take a moment.</p>
            </div>
          )}

          {complianceResult && previewUrl && (
            <div className='flex-grow flex flex-col'>
               <div className='flex justify-between items-center mb-4'>
                    <h3 className="text-lg font-bold font-headline">Analysis Result</h3>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <PlusCircle className="mr-2"/>
                        Analyze Another
                    </Button>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4 flex-grow">
                <div className="space-y-2 h-full flex flex-col">
                    <h4 className="text-sm font-semibold text-center">Original Design</h4>
                    <div className="border rounded-lg p-2 bg-card flex-grow flex items-center justify-center">
                      <Image src={previewUrl} alt="Design preview" width={400} height={225} className="rounded-md object-contain max-h-full" data-ai-hint="abstract design" />
                    </div>
                </div>

                <div className="space-y-2 h-full flex flex-col">
                    <div className="flex justify-between items-center text-center">
                      <h4 className="text-sm font-semibold flex-1">AI-Corrected Preview</h4>
                      {correctedPreviewUri && (
                          <Button variant="ghost" size="sm" onClick={onHighlightDifferences} disabled={isHighlighting} className="text-xs">
                            {isHighlighting ? <Loader2 className="animate-spin mr-1"/> : <Microscope className="mr-1"/>}
                              Highlight Diffs
                          </Button>
                      )}
                    </div>
                    <div className="border rounded-lg p-2 bg-card min-h-[150px] flex items-center justify-center relative flex-grow">
                      {(isApplyingFixes && applyingFixIndex === null) && (
                          <div className="flex flex-col items-center text-muted-foreground text-sm">
                              <Loader2 size={24} className="animate-spin mb-2" />
                              <p>Generating preview...</p>
                          </div>
                      )}
                      {!(isApplyingFixes && applyingFixIndex === null) && !correctedPreviewUri && (
                          <p className="text-muted-foreground text-sm text-center p-4">Preview of fixes will appear here.</p>
                      )}
                      {correctedPreviewUri && (
                          <>
                            <Image 
                                  src={activePreview === 'highlighted' ? (highlightedPreviewUri || correctedPreviewUri) : correctedPreviewUri} 
                                  alt={activePreview === 'corrected' ? "Fixed design" : "Highlighted differences"} 
                                  width={400} 
                                  height={225} 
                                  className="rounded-md object-contain max-h-full"
                                  data-ai-hint="abstract design"
                              />
                              <div className="absolute top-1 right-1 flex gap-1">
                                  {highlightedPreviewUri && (
                                      <Button size="icon" variant={activePreview === 'corrected' ? 'secondary' : 'ghost'} className="h-7 w-7" onClick={() => setActivePreview('corrected')} title="Show Corrected Version">
                                          <Wand2 />
                                      </Button>
                                  )}
                                  {highlightedPreviewUri && (
                                      <Button size="icon" variant={activePreview === 'highlighted' ? 'secondary' : 'ghost'} className="h-7 w-7" onClick={() => setActivePreview('highlighted')} title="Show Highlighted Differences">
                                          <Microscope />
                                      </Button>
                                  )}
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDownload(activePreview === 'corrected' ? correctedPreviewUri : (highlightedPreviewUri || correctedPreviewUri), 'fixed-design.png')}>
                                      <Download />
                                  </Button>
                              </div>
                          </>
                      )}
                    </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-4 border-t pt-4">
                <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-card rounded-lg border">
                  <ComplianceScoreCircle score={complianceResult.complianceScore} />
                   <div className="flex items-center space-x-2 mt-4">
                        <Switch id="peer-review" onCheckedChange={onTogglePeerReview} checked={isPeerFeedbackRequested} disabled={isPending} />
                        <Label htmlFor="peer-review" className="text-sm flex items-center gap-1"><Users className='h-4 w-4'/> Request Peer Feedback</Label>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold flex items-center gap-2 text-sm"><MessageCircle size={16}/> AI Feedback</h3>
                    <p className="text-xs text-muted-foreground">{complianceResult.feedback}</p>
                  </div>

                  {complianceResult.fixes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                          <h3 className="font-semibold flex items-center gap-2 text-sm"><Sparkles size={16}/> Auto-Fix Suggestions</h3>
                          <Button 
                              size="sm"
                              onClick={() => onApplyFixes(complianceResult.fixes, null)}
                              disabled={isApplyingFixes && applyingFixIndex === null}
                              className='text-xs'
                            >
                              {isApplyingFixes && applyingFixIndex === null ? <Loader2 className="animate-spin mr-2" /> : <RefreshCcw className="mr-2" />}
                              Instant Brandify
                            </Button>
                        </div>
                        <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-2">
                          {complianceResult.fixes.map((fix, index) => (
                            <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0 h-3 w-3"/>
                                <span>{fix.description}</span>
                              </div>
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => onApplyFixes([fix], index)}
                                disabled={isApplyingFixes && applyingFixIndex === index}
                                className="shrink-0 h-6 px-2"
                              >
                                {isApplyingFixes && applyingFixIndex === index ? <Loader2 className="animate-spin" /> : <Wand2 className='h-3 w-3'/>}
                              </Button>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
