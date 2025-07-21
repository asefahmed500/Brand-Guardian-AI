
'use client';

import { useState, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { ProjectWithDetails } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleExtractColors, handleGenerateLayout, handlePromptToDesign } from '@/lib/actions';
import { UploadCloud, Palette, Wand2, Lightbulb, Loader2, Brush, FileText, ImageIcon, X } from 'lucide-react';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface CreativeStudioProps {
  project: ProjectWithDetails;
}

export function CreativeStudio({ project }: CreativeStudioProps) {
    const { toast } = useToast();

    // Color Moodboard State
    const [colorImageFile, setColorImageFile] = useState<File | null>(null);
    const [colorImagePreview, setColorImagePreview] = useState<string | null>(null);
    const [isExtractingColors, setIsExtractingColors] = useState(false);
    const [colorResult, setColorResult] = useState<{extractedColors: string[], complianceFeedback: string} | null>(null);
    const colorFileInputRef = useRef<HTMLInputElement>(null);

    // Layout Composer State
    const [headline, setHeadline] = useState('');
    const [bodyText, setBodyText] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);
    const [layoutResultUri, setLayoutResultUri] = useState<string | null>(null);
    
    // Prompt to Design state
    const [prompt, setPrompt] = useState('');
    const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
    const [promptDesignResultUri, setPromptDesignResultUri] = useState<string | null>(null);


    const handleColorFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setColorImageFile(file);
            setColorResult(null);
            if (colorImagePreview) URL.revokeObjectURL(colorImagePreview);
            setColorImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleRemoveColorImage = () => {
        setColorImageFile(null);
        setColorResult(null);
        if (colorImagePreview) URL.revokeObjectURL(colorImagePreview);
        setColorImagePreview(null);
        if (colorFileInputRef.current) {
            colorFileInputRef.current.value = '';
        }
    }


    const handleExtractColorsSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!colorImageFile || !project.brandFingerprint) return;

        setIsExtractingColors(true);
        setColorResult(null);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const dataUri = event.target?.result as string;
                const result = await handleExtractColors(dataUri, project.brandFingerprint);
                setColorResult(result);
                 toast({ title: 'Colors Extracted', description: 'AI has analyzed your image and suggested a palette.' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Color Extraction Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
            } finally {
                setIsExtractingColors(false);
            }
        };
        reader.readAsDataURL(colorImageFile);
    };

    const handleLayoutSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!project.brandFingerprint || (!headline && !bodyText && !imagePrompt)) {
            toast({ variant: 'destructive', title: 'Missing Input', description: 'Please provide a headline, text, or image prompt.' });
            return;
        }

        setIsGeneratingLayout(true);
        setLayoutResultUri(null);
        try {
            const result = await handleGenerateLayout(project.brandFingerprint, headline, bodyText, imagePrompt);
            setLayoutResultUri(result.layoutDataUri);
            toast({ title: 'Layout Generated', description: 'Your brand-aligned layout is ready.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Layout Generation Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
        } finally {
            setIsGeneratingLayout(false);
        }
    }
    
    const handlePromptToDesignSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!prompt || !project.brandFingerprint) {
            toast({ variant: 'destructive', title: 'Missing Input', description: 'Please provide a prompt.' });
            return;
        }

        setIsGeneratingFromPrompt(true);
        setPromptDesignResultUri(null);
        try {
            const result = await handlePromptToDesign(project.brandFingerprint, prompt);
            setPromptDesignResultUri(result.designDataUri);
            toast({ title: 'Design Generated', description: 'Your brand-aligned design is ready.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Design Generation Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
        } finally {
            setIsGeneratingFromPrompt(false);
        }
    }


  return (
    <Card>
      <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 className="text-primary"/>
            Creative AI Studio
          </CardTitle>
          <CardDescription>Use generative AI to kickstart your creative process with on-brand assets. Describe an idea, compose a layout, or find color inspiration.</CardDescription>
      </CardHeader>
      <CardContent>
          <Tabs defaultValue="prompt-to-design">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prompt-to-design">
                <FileText className="mr-2" />
                Prompt to Design
              </TabsTrigger>
              <TabsTrigger value="layout-composer">
                <Brush className="mr-2" />
                Layout Composer
              </TabsTrigger>
              <TabsTrigger value="color-moodboard">
                <Palette className="mr-2" />
                Color Moodboard
              </TabsTrigger>
            </TabsList>
            
            {/* Prompt to Design Tab */}
            <TabsContent value="prompt-to-design" className="mt-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                      <h3 className="font-semibold mb-2">1. Describe Your Design</h3>
                      <p className="text-sm text-muted-foreground mb-4">Be descriptive! The more detail you provide, the better the result. Mention the purpose, style, and any key elements.</p>
                      <form onSubmit={handlePromptToDesignSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="design-prompt">Design Prompt</Label>
                            <Textarea 
                                id="design-prompt" 
                                placeholder="e.g., An Instagram story announcing a 24-hour flash sale on all winter jackets, with a modern, minimalist feel."
                                value={prompt} 
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isGeneratingFromPrompt}>
                            {isGeneratingFromPrompt ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                            Generate Design
                        </Button>
                     </form>
                  </div>
                   <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">2. Generated Result</h3>
                        <div className="flex-grow flex justify-center items-center p-4 min-h-[300px] border rounded-lg bg-muted/30">
                            {isGeneratingFromPrompt && (
                                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 h-full">
                                    <Loader2 size={32} className="animate-spin mb-4" />
                                    <p className='text-lg'>AI is creating your design...</p>
                                    <p className='text-sm'>This can take up to a minute.</p>
                                </div>
                            )}
                            {promptDesignResultUri && (
                                <Image 
                                    src={promptDesignResultUri}
                                    alt="AI Generated Design"
                                    width={500}
                                    height={500}
                                    className="rounded-lg object-contain max-h-full"
                                    data-ai-hint="graphic design layout"
                                />
                            )}
                             {!isGeneratingFromPrompt && !promptDesignResultUri && (
                                <p className="text-sm text-muted-foreground text-center">Your generated design will appear here.</p>
                            )}
                        </div>
                   </div>
               </div>
            </TabsContent>

            {/* Layout Composer Tab */}
            <TabsContent value="layout-composer" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                      <h3 className="font-semibold mb-2">1. Compose Your Content</h3>
                      <p className="text-sm text-muted-foreground mb-4">Provide the building blocks for your layout. The AI will arrange them according to your brand rules.</p>
                      <form onSubmit={handleLayoutSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="headline" className='flex items-center gap-2'><FileText/> Headline (Optional)</Label>
                            <Input id="headline" placeholder="e.g., Summer Sale" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bodyText" className='flex items-center gap-2'><FileText/> Body Text (Optional)</Label>
                            <Textarea id="bodyText" placeholder="e.g., Get 50% off all items..." value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imagePrompt" className='flex items-center gap-2'><ImageIcon/> Image Prompt (Optional)</Label>
                            <Input id="imagePrompt" placeholder="e.g., A sunny beach with palm trees" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isGeneratingLayout}>
                            {isGeneratingLayout ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                            Generate Layout
                        </Button>
                     </form>
                  </div>
                  <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">2. Generated Layout</h3>
                        <div className="flex-grow flex justify-center items-center p-4 min-h-[300px] border rounded-lg bg-muted/30">
                            {isGeneratingLayout && (
                                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 h-full">
                                    <Loader2 size={32} className="animate-spin mb-4" />
                                    <p className='text-lg'>AI is composing your layout...</p>
                                    <p className='text-sm'>This can take up to a minute.</p>
                                </div>
                            )}
                            {layoutResultUri && (
                                <Image 
                                    src={layoutResultUri}
                                    alt="AI Generated Layout"
                                    width={500}
                                    height={500}
                                    className="rounded-lg object-contain max-h-full"
                                    data-ai-hint="graphic design layout"
                                />
                            )}
                             {!isGeneratingLayout && !layoutResultUri && (
                                <p className="text-sm text-muted-foreground text-center">Your generated layout will appear here.</p>
                            )}
                        </div>
                   </div>
              </div>
            </TabsContent>

            {/* Color Moodboard Tab */}
            <TabsContent value="color-moodboard" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                   <h3 className="font-semibold mb-2">1. Upload an Image</h3>
                   <p className="text-sm text-muted-foreground mb-4">Choose an image to generate a color palette from. This is great for finding brand-adjacent color ideas from photos or existing artwork.</p>
                   <form onSubmit={handleExtractColorsSubmit} className="space-y-4">
                        <Input id="color-image-upload" type="file" accept="image/*" onChange={handleColorFileChange} className="hidden" ref={colorFileInputRef} />
                        
                        {!colorImagePreview && (
                            <Button type="button" variant="outline" className="w-full" onClick={() => colorFileInputRef.current?.click()}>
                                <UploadCloud className="mr-2" /> Upload Inspirational Image
                            </Button>
                        )}
                        
                        {colorImagePreview && (
                             <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" className="w-full" onClick={() => colorFileInputRef.current?.click()}>
                                    <UploadCloud className="mr-2" /> Change Image
                                </Button>
                                <Button type="button" variant="destructive" className="w-full" onClick={handleRemoveColorImage}>
                                    <X className="mr-2" /> Remove Image
                                </Button>
                            </div>
                        )}

                        {colorImagePreview && (
                            <div className="mt-2 rounded-md border p-2 flex justify-center bg-card">
                                <Image src={colorImagePreview} alt="Color extraction preview" width={150} height={150} className="object-contain rounded-md" />
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isExtractingColors || !colorImageFile}>
                            {isExtractingColors ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                            Extract Colors
                        </Button>
                    </form>
                </div>
                <div className="flex flex-col">
                   <h3 className="font-semibold mb-2">2. Extracted Palette & Analysis</h3>
                   <div className="flex-grow space-y-4 pt-4 border rounded-lg p-4 bg-muted/30 min-h-[200px]">
                        {colorResult && (
                            <>
                                 <h4 className="font-semibold">Extracted Palette:</h4>
                                 <div className="flex gap-2 flex-wrap">
                                    {colorResult.extractedColors.map(color => (
                                        <div key={color} className="h-10 w-10 rounded-full border" style={{ backgroundColor: color }} title={color} />
                                    ))}
                                </div>
                                <div className="flex items-start gap-3 text-sm text-muted-foreground p-3 bg-background rounded-lg">
                                    <Lightbulb className="text-yellow-500 h-5 w-5 mt-1 flex-shrink-0" />
                                    <div>
                                        <h5 className="font-semibold text-foreground">AI Compliance Check</h5>
                                        <p className="text-xs">{colorResult.complianceFeedback}</p>
                                    </div>
                                </div>
                            </>
                        )}
                         {!colorResult && !isExtractingColors && (
                            <div className="flex items-center justify-center h-full">
                               <p className="text-sm text-muted-foreground text-center">Your palette and analysis will appear here.</p>
                            </div>
                        )}
                        {isExtractingColors && (
                            <div className="flex items-center justify-center h-full">
                               <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                                    <Loader2 size={24} className="animate-spin mb-4" />
                                    <p>AI is analyzing your image...</p>
                                </div>
                            </div>
                        )}
                   </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
      </CardContent>
    </Card>
  );
}
