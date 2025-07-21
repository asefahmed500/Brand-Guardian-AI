
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileImage, Loader2, Sparkles } from 'lucide-react';
import type { BrandFingerprint, GeneratedTemplate } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface BrandTemplateGeneratorPanelProps {
  brandFingerprint: BrandFingerprint | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  templates: GeneratedTemplate[] | null;
}

export function BrandTemplateGeneratorPanel({ brandFingerprint, onGenerate, isGenerating, templates }: BrandTemplateGeneratorPanelProps) {
  if (!brandFingerprint) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <FileImage className="text-primary" />
          Template Generator
        </CardTitle>
        <CardDescription>Create on-brand templates with one click.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
          Generate Templates
        </Button>

        {isGenerating && (
         <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-sm">
           <Loader2 size={24} className="animate-spin mb-2" />
           <p>AI is creating your templates...</p>
         </div>
        )}
        
        {templates && templates.length > 0 && (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {templates.map((template, index) => (
                <CarouselItem key={index} className="lg:basis-full">
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <CardContent className="flex-col aspect-square items-center justify-center p-2 space-y-2">
                        <Image 
                          src={template.imageDataUri} 
                          alt={template.templateName} 
                          width={200}
                          height={200}
                          className="rounded-md object-cover w-full h-full"
                          data-ai-hint="design template"
                        />
                        <p className="text-xs text-muted-foreground truncate" title={template.templateName}>{template.templateName}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
