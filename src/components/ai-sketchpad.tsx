
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text, Rect, Circle, Image as KonvaImage } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Pen, RectangleHorizontal, Circle as CircleIcon, Eraser, Type, Upload, Sparkles, Palette, Trash2, Loader2, X } from 'lucide-react';
import type { ProjectWithDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleColorizeSketch, handleEnhanceSketch } from '@/lib/actions';
import Image from 'next/image';

interface AISketchpadProps {
  project: ProjectWithDetails;
}

type Tool = 'pen' | 'rectangle' | 'circle' | 'eraser' | 'text';

interface Shape {
  id: string;
  type: Tool;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export function AISketchpad({ project }: AISketchpadProps) {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<'enhance' | 'colorize' | false>(false);
  
  const stageRef = useRef<StageType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) {
      return;
    }
    setIsDrawing(true);
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const commonProps = {
        fill: tool === 'pen' ? color : (tool === 'text' ? color : 'transparent'),
        stroke: color,
        strokeWidth: tool === 'pen' ? 5 : 2,
    };
    
    let newShape: Shape;

    if (tool === 'pen' || tool === 'eraser') {
      newShape = {
        id: Date.now().toString(),
        type: tool,
        points: [pos.x, pos.y],
        fill: tool === 'pen' ? color : '#FFFFFF', // Eraser uses white to "erase" on a white bg
        stroke: tool === 'pen' ? color : '#FFFFFF',
        strokeWidth: tool === 'pen' ? 5 : 20,
      };
    } else if (tool === 'rectangle' || tool === 'circle' || tool === 'text') {
       newShape = {
          id: Date.now().toString(),
          type: tool,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          radius: 0,
          text: tool === 'text' ? 'New Text' : undefined,
          fontSize: 24,
          ...commonProps,
       };
    } else {
        return;
    }
    setShapes([...shapes, newShape]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    let lastShape = shapes[shapes.length - 1];
    if (!lastShape) return;
    
    const newShapes = shapes.slice();
    let shapeToUpdate = { ...newShapes[newShapes.length - 1] };


    if (tool === 'pen' || tool === 'eraser') {
      shapeToUpdate.points = shapeToUpdate.points?.concat([point.x, point.y]);
    } else if (tool === 'rectangle' && shapeToUpdate.x && shapeToUpdate.y) {
        shapeToUpdate.width = point.x - shapeToUpdate.x;
        shapeToUpdate.height = point.y - shapeToUpdate.y;
    } else if (tool === 'circle' && shapeToUpdate.x && shapeToUpdate.y) {
        const dx = point.x - shapeToUpdate.x;
        const dy = point.y - shapeToUpdate.y;
        shapeToUpdate.radius = Math.sqrt(dx * dx + dy * dy);
    } else {
        return;
    }
    
    newShapes[newShapes.length - 1] = shapeToUpdate;
    setShapes(newShapes);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  const handleTextDblClick = (index: number) => {
    const textNode = stageRef.current?.findOne('#' + shapes[index].id);
    if (textNode) {
      const text = prompt('Enter new text:', shapes[index].text);
      if (text !== null) {
        const newShapes = [...shapes];
        newShapes[index].text = text;
        setShapes(newShapes);
      }
    }
  };

  const handleExport = () => {
    return stageRef.current?.toDataURL({ mimeType: 'image/png' });
  };
  
  const clearCanvas = () => {
    setShapes([]);
    setAiResult(null);
  }

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleAIAction = async (action: 'enhance' | 'colorize') => {
    const imageDataUri = handleExport();
    if (!imageDataUri || !project.brandFingerprint) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not export canvas or missing brand fingerprint.' });
      return;
    }
    
    setIsLoading(action);
    setAiResult(null);

    try {
      const brandFingerprint = JSON.stringify(project.brandFingerprint);
      let result;
      if (action === 'enhance') {
        result = await handleEnhanceSketch({ sketchDataUri: imageDataUri, brandFingerprint });
        setAiResult(result.enhancedDesignDataUri);
      } else {
        result = await handleColorizeSketch({ sketchDataUri: imageDataUri, brandFingerprint });
        setAiResult(result.colorizedSketchDataUri);
      }
      toast({ title: 'AI Magic Complete!', description: `Your sketch has been ${action}d.`});
    } catch(error) {
       toast({ variant: 'destructive', title: 'AI Action Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          setShapes([]);
          setAiResult(null);
          setBackgroundImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const ToolbarButton = ({ label, icon, value }: { label: string; icon: React.ReactNode; value: Tool }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
              variant={tool === value ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setTool(value)}
            >
              {icon}
            </Button>
        </TooltipTrigger>
        <TooltipContent><p>{label}</p></TooltipContent>
    </Tooltip>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Canvas</CardTitle>
                <CardDescription>A space for your rough ideas. Draw a concept, then use the AI Actions to transform it into a polished, brand-compliant design. Double-click text to edit.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                  <div className="flex flex-wrap gap-2 border p-2 rounded-md mb-4 justify-center">
                    <ToolbarButton label="Pen" icon={<Pen />} value="pen" />
                    <ToolbarButton label="Rectangle" icon={<RectangleHorizontal />} value="rectangle" />
                    <ToolbarButton label="Circle" icon={<CircleIcon />} value="circle" />
                    <ToolbarButton label="Text" icon={<Type />} value="text" />
                    <ToolbarButton label="Eraser" icon={<Eraser />} value="eraser" />
                    <div className="flex items-center gap-2 border-l pl-2 ml-2">
                       <Label htmlFor="color-picker" className="text-sm">Color:</Label>
                       <Input id="color-picker" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 p-1 h-8"/>
                    </div>
                  </div>
                </TooltipProvider>
                <div className="border rounded-lg overflow-hidden bg-white">
                    <Stage
                        width={800}
                        height={600}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        ref={stageRef}
                        className="cursor-crosshair"
                    >
                        <Layer>
                            <Rect width={800} height={600} fill="white" />
                            {backgroundImage && <KonvaImage image={backgroundImage} width={800} height={600} />}
                        </Layer>
                        <Layer>
                            {shapes.map((shape, i) => {
                                if (shape.type === 'pen' || shape.type === 'eraser') {
                                    return <Line key={shape.id} id={shape.id} points={shape.points} stroke={shape.stroke} strokeWidth={shape.strokeWidth} tension={0.5} lineCap="round" globalCompositeOperation={shape.type === 'eraser' ? 'destination-out' : 'source-over'}/>
                                }
                                if (shape.type === 'rectangle') {
                                    return <Rect key={shape.id} id={shape.id} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/>
                                }
                                if (shape.type === 'circle') {
                                    return <Circle key={shape.id} id={shape.id} x={shape.x} y={shape.y} radius={shape.radius} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/>
                                }
                                if (shape.type === 'text') {
                                    return <Text key={shape.id} id={shape.id} x={shape.x} y={shape.y} text={shape.text} fontSize={shape.fontSize} fill={shape.fill} onDblClick={() => handleTextDblClick(i)} draggable/>
                                }
                                return null;
                            })}
                        </Layer>
                    </Stage>
                </div>
            </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>AI Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                     <Button className="w-full" onClick={() => handleAIAction('enhance')} disabled={!!isLoading}>
                        {isLoading === 'enhance' ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        Brandify Sketch
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => handleAIAction('colorize')} disabled={!!isLoading}>
                         {isLoading === 'colorize' ? <Loader2 className="animate-spin mr-2" /> : <Palette className="mr-2" />}
                        Colorize Sketch
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Upload className="text-primary"/>Canvas Controls</CardTitle>
                     <CardDescription className="text-xs">Use an existing image as a guide for your sketch.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Input id="image-upload" type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    <Button className="w-full" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2"/> Import Image to Trace
                    </Button>
                    {backgroundImage && (
                       <Button className="w-full" variant="outline" onClick={removeBackgroundImage}>
                            <X className="mr-2"/> Remove Imported Image
                        </Button>
                    )}
                    <Button className="w-full" variant="destructive" onClick={clearCanvas}>
                        <Trash2 className="mr-2"/> Clear Your Drawings
                    </Button>
                </CardContent>
            </Card>
            {(isLoading || aiResult) && (
                <Card>
                    <CardHeader>
                        <CardTitle>AI Result</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center min-h-60">
                        {isLoading && (
                            <div className="text-center text-muted-foreground">
                                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2"/>
                                <p>AI is thinking...</p>
                            </div>
                        )}
                        {aiResult && <Image src={aiResult} alt="AI generated result" width={400} height={300} className="rounded-md object-contain" data-ai-hint="ai generated art"/>}
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
