'use client';

import { useSession } from 'next-auth/react';
import type { ComplianceResult, GeneratedTemplate, ProjectWithDetails } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart2, Users, FileImage, ShieldAlert, MessageSquare, Check, X, Clock, HelpCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { ManagerApprovalDialog } from './manager-approval-dialog';
import { ManagerAnnouncementDialog } from './manager-announcement-dialog';

import { BrandSetupPanel } from './brand-setup-panel';
import { BrandTemplateGeneratorPanel } from './brand-template-generator-panel';
import { BrandAssetLibraryPanel } from './brand-asset-library-panel';
import { DesignCompliancePanel } from './design-compliance-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';


interface BrandManagerDashboardProps {
  project: ProjectWithDetails;
  onAnalyzeDesign: (designDataUri: string, designContext: string) => Promise<void>;
  isAnalyzingDesign: boolean;
  complianceResult: ComplianceResult | null;
  onGenerateTemplates: () => Promise<void>;
  isGeneratingTemplates: boolean;
  generatedTemplates: GeneratedTemplate[] | null;
}

function processViolationData(project: ProjectWithDetails) {
    const violationCounts: { [key: string]: number } = {
        color: 0,
        typography: 0,
        layout: 0,
        other: 0,
    };

    project.designs.forEach(design => {
        (design.suggestedFixes || []).forEach(fix => {
            const type = fix.type || 'other';
            if (violationCounts.hasOwnProperty(type)) {
                violationCounts[type]++;
            } else {
                violationCounts.other++;
            }
        });
    });

    return Object.entries(violationCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        violations: count,
    }));
}


export function BrandManagerDashboard({ 
    project,
    onAnalyzeDesign,
    isAnalyzingDesign,
    complianceResult,
    onGenerateTemplates,
    isGeneratingTemplates,
    generatedTemplates,
}: BrandManagerDashboardProps) {
  const { data: session } = useSession();
  const violationData = processViolationData(project);
  
  const designsForReview = project.designs.filter(d => d.status === 'pending');
  const designsHistory = project.designs.filter(d => d.status !== 'pending');
  const averageScore = project.designs.length > 0 
    ? Math.round(project.designs.reduce((acc, d) => acc + d.complianceScore, 0) / project.designs.length) 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'approved': return <Check className="h-4 w-4 text-green-500" />;
        case 'rejected': return <X className="h-4 w-4 text-destructive" />;
        case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        default: return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const brandFingerprint = project.brandFingerprint;
  const userRole = session?.user?.role;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div/>
        <ManagerAnnouncementDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <FileImage className="h-6 w-6 text-primary" />
                    Total Designs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{project.designs.length}</p>
                <p className="text-xs text-muted-foreground">Analyzed in this project</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    Designs for Review
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{designsForReview.length}</p>
                 <p className="text-xs text-muted-foreground">Awaiting manager approval</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Users className="h-6 w-6 text-primary" />
                    Contributors
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{[...new Set(project.designs.map(d => d.userId))].length}</p>
                <p className="text-xs text-muted-foreground">Unique users submitting designs</p>
            </CardContent>
        </Card>
      </div>
      
       <Card>
        <Tabs defaultValue="review">
            <CardHeader>
                 <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="review">
                        <MessageSquare className="mr-2" />
                        Approval Queue
                        {designsForReview.length > 0 && <Badge variant="destructive" className="ml-2">{designsForReview.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <Clock className="mr-2" />
                        Design History
                    </TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <TabsContent value="review">
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Design</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {designsForReview.length > 0 ? designsForReview.map(design => (
                            <TableRow key={design._id}>
                            <TableCell className="font-medium">
                                <Avatar className="h-10 w-10 rounded-md">
                                    <AvatarImage src={design.originalImageUrl} alt="design thumbnail" />
                                    <AvatarFallback>{design.designContext[0]}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>{design.userName || 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={design.complianceScore > 70 ? 'default' : 'destructive'}>{design.complianceScore}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <ManagerApprovalDialog design={design} />
                            </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                                    No designs are currently pending review. Great job!
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="history">
                     <ScrollArea className="h-80">
                         <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Design</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {designsHistory.length > 0 ? designsHistory.map(design => (
                                <TableRow key={design._id}>
                                    <TableCell className="font-medium">
                                        <Avatar className="h-10 w-10 rounded-md">
                                            <AvatarImage src={design.originalImageUrl} alt="design thumbnail" />
                                            <AvatarFallback>{design.designContext[0]}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>{design.userName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(design.status)}
                                            <span className="capitalize">{design.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(design.createdAt), { addSuffix: true })}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={design.complianceScore > 70 ? 'secondary' : 'destructive'}>{design.complianceScore}</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                        No past designs found.
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                     </ScrollArea>
                </TabsContent>
            </CardContent>
        </Tabs>
      </Card>
       
       <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                    <div className="flex items-center gap-4">
                        <BarChart2 className="h-8 w-8 text-primary" />
                        <div>
                        <CardTitle>Violation Hotspots</CardTitle>
                        <CardDescription>Common non-compliance reasons.</CardDescription>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={violationData} layout="horizontal" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false}/>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Bar dataKey="violations" radius={[4, 4, 0, 0]}>
                                    {violationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <BrandSetupPanel 
                    project={project}
                    userRole={userRole}
                />
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
            <div className="lg:col-span-2">
                <DesignCompliancePanel 
                    onAnalyze={onAnalyzeDesign}
                    isAnalyzing={isAnalyzingDesign}
                    complianceResult={complianceResult}
                    brandFingerprint={brandFingerprint}
                    designs={project.designs}
                />
            </div>
        </div>
    </div>
  );
}
