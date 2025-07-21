
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library } from 'lucide-react';
import type { ProjectWithDetails } from '@/lib/types';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { NewAssetDialog } from './new-asset-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AssetPermissionsDialog } from './asset-permissions-dialog';
import { useSession } from 'next-auth/react';


interface BrandAssetLibraryPanelProps {
  project: ProjectWithDetails;
}

export function BrandAssetLibraryPanel({ project }: BrandAssetLibraryPanelProps) {
  const { data: session } = useSession();
  const canManage = session?.user.role === 'admin' || session?.user.role === 'brand_manager';

  const allAssets = [
    { name: 'Logo', type: 'logo', dataUri: project.logoDataUri, _id: 'logo' },
    ...project.assets
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                <Library className="text-primary" />
                Asset Library
                </CardTitle>
                <CardDescription>Your brand's approved assets.</CardDescription>
            </div>
            { canManage && <NewAssetDialog projectId={project._id} /> }
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4">
                {allAssets.map((asset) => (
                    <div key={asset._id} className="space-y-2 text-center w-24 group relative">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                     <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-card p-2 overflow-hidden hover:shadow-md transition-shadow">
                                        <Image 
                                            src={asset.dataUri} 
                                            alt={asset.name} 
                                            width={80}
                                            height={80}
                                            className="object-contain"
                                            data-ai-hint={`${asset.type} ${asset.name}`}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{asset.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                        { canManage && <AssetPermissionsDialog assetName={asset.name} /> }
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
