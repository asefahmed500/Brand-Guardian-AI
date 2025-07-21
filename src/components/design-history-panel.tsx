
'use client';

import { useState } from 'react';
import type { Design } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { LineChart as SparklineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { History, NotebookText, Tag, FilterX, Search } from 'lucide-react';
import { DesignNotesDialog } from './design-notes-dialog';
import { DesignTagsDialog } from './design-tags-dialog';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';

interface DesignHistoryPanelProps {
  designs: Design[];
}

export function DesignHistoryPanel({ designs }: DesignHistoryPanelProps) {
  const [filter, setFilter] = useState('');

  const filteredDesigns = designs.filter(design => 
    filter === '' || 
    design.designContext.toLowerCase().includes(filter.toLowerCase()) ||
    design.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
  );
  
  const scoreHistory = designs
    .map(d => ({ score: d.complianceScore }))
    .reverse();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-destructive';
  }

  const getSparklineColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 50) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                <History className="text-primary" />
                Design History
                </CardTitle>
                <CardDescription>A journal of your analyzed designs, scores, and personal notes.</CardDescription>
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Filter by tag or context..."
                    className="pl-9"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Score Trend</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredDesigns.length > 0 ? filteredDesigns.map((design, index) => (
                <TableRow key={design._id}>
                    <TableCell>
                    <Image
                        src={design.originalImageUrl}
                        alt="Design thumbnail"
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                        data-ai-hint="design thumbnail"
                    />
                    </TableCell>
                    <TableCell>
                        <p className="font-medium">{design.designContext}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(design.createdAt), { addSuffix: true })}
                        </p>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {design.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                            {design.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{design.tags.length - 2}</Badge>
                            )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={design.complianceScore > 70 ? 'default' : 'destructive'} className={`${getScoreColor(design.complianceScore)} bg-opacity-10`}>
                            {design.complianceScore}
                        </Badge>
                    </TableCell>
                    <TableCell>
                         <div className="h-8 w-24">
                            <ResponsiveContainer>
                                <SparklineChart data={scoreHistory.slice(0, designs.length - index)}>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', padding: '2px 8px' }} 
                                        labelStyle={{ display: 'none' }}
                                        itemStyle={{ fontSize: '10px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke={getSparklineColor(design.complianceScore)}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </SparklineChart>
                            </ResponsiveContainer>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(design.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right space-x-0">
                        <DesignTagsDialog design={design} />
                        <DesignNotesDialog design={design} />
                    </TableCell>
                </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <FilterX className="h-8 w-8" />
                                <p className="font-semibold">No designs found</p>
                                <p className="text-sm">Try adjusting your filter.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
