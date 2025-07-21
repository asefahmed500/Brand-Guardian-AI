
'use client';

import type { Design } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

interface PersonalAnalyticsPanelProps {
  designs: Design[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function processViolationData(designs: Design[]) {
    const violationCounts: { [key: string]: number } = {
        color: 0,
        typography: 0,
        layout: 0,
        other: 0,
    };

    designs.forEach(design => {
        (design.suggestedFixes || []).forEach(fix => {
            const type = fix.type || 'other';
            if (violationCounts.hasOwnProperty(type)) {
                violationCounts[type]++;
            } else {
                violationCounts.other++;
            }
        });
    });
    
    return Object.entries(violationCounts)
        .map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            violations: count,
        }))
        .filter(item => item.violations > 0);
}

export function PersonalAnalyticsPanel({ designs }: PersonalAnalyticsPanelProps) {
  const violationData = processViolationData(designs);
  const averageScore = designs.length > 0 ? Math.round(designs.reduce((acc, d) => acc + d.complianceScore, 0) / designs.length) : 0;
  const mostCommonViolation = violationData.length > 0 ? violationData.sort((a,b) => b.violations - a.violations)[0].name.toLowerCase() : null;

  const scoreHistory = [...designs]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(d => ({
        date: format(new Date(d.createdAt), 'MMM d'),
        score: d.complianceScore
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <TrendingUp className="text-primary" />
          Analytics Overview
        </CardTitle>
        <CardDescription>A summary of your design compliance activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around text-center border-b pb-4">
            <div>
                <p className="text-2xl font-bold font-headline">{averageScore}</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
             <div>
                <p className="text-2xl font-bold font-headline">{designs.length}</p>
                <p className="text-xs text-muted-foreground">Designs Analyzed</p>
            </div>
        </div>

        {scoreHistory.length > 1 && (
            <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><TrendingUp className="text-primary" /> Score Timeline</h4>
                <div className="h-[150px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={scoreHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {violationData.length > 0 && (
            <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><AlertCircle className="text-primary" /> Common Issues</h4>
                <div className="h-[150px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={violationData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={70} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="violations" radius={[0, 4, 4, 0]}>
                                {violationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {mostCommonViolation && (
            <div className="border-t pt-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                    <Lightbulb className="text-yellow-500 h-5 w-5 mt-1 flex-shrink-0" />
                    <div>
                        <h5 className="font-semibold text-foreground">Weekly Designer Tip</h5>
                        <p className="text-xs">
                           Your layout scores are great! Try focusing more on consistent {mostCommonViolation} choices to boost your compliance.
                        </p>
                    </div>
                </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
}
