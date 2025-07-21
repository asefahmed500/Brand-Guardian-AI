
'use client';

import { useState, type FormEvent, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, Library, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { handleCreateAsset } from '@/lib/actions';

interface NewAssetDialogProps {
    projectId: string;
}

export function NewAssetDialog({ projectId }: NewAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAssetFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      if (!assetName) {
        setAssetName(file.name.split('.').slice(0, -1).join('.'));
      }
    }
  };
  
  const resetForm = () => {
    setAssetName('');
    setAssetFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleRemoveImage = () => {
    setAssetFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!assetFile || !assetName) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUri = event.target?.result as string;
        await handleCreateAsset({
            projectId,
            name: assetName,
            dataUri
        });
        toast({
          title: 'Asset Uploaded',
          description: `"${assetName}" has been added to your library.`,
        });
        router.refresh();
        setOpen(false);
        resetForm();

      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(assetFile);
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if(!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload a New Asset</DialogTitle>
          <DialogDescription>
            Add a new asset to your project library (e.g., secondary logos, icons). It will be automatically tagged by AI.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              placeholder="e.g., Primary Logo Dark"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-upload">Asset File</Label>
            <Input id="asset-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange} className="hidden" ref={fileInputRef} required={!assetFile}/>
            
            {!previewUrl && (
              <Button type="button" variant="outline" className="w-full" onClick={triggerFileSelect}>
                <UploadCloud className="mr-2" />
                Choose file
              </Button>
            )}

            {previewUrl && (
              <div className="mt-2 rounded-md border p-2 flex justify-center items-center bg-card relative">
                <Image src={previewUrl} alt="Asset preview" width={80} height={80} className="object-contain" />
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
            )}
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isUploading || !assetFile || !assetName}>
              {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Library className="mr-2" />}
              Add to Library
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
