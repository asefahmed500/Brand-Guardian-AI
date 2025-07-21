
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
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, Sparkles, FolderPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleCreateProject } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setProjectName('');
    setBrandDescription('');
    setLogoFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
     if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleRemoveImage = () => {
    setLogoFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!logoFile || !brandDescription || !projectName) return;

    setIsCreating(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUri = event.target?.result as string;
        const newProject = await handleCreateProject({
            name: projectName,
            brandDescription,
            logoDataUri: dataUri
        });
        toast({
          title: 'Project Created',
          description: `"${newProject.name}" has been successfully created.`,
        });
        router.refresh();
        setOpen(false);
        resetForm();

      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Creation Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      } finally {
        setIsCreating(false);
      }
    };
    reader.readAsDataURL(logoFile);
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <FolderPlus className="mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Define a new brand by providing a name, logo, and description. This will create your brand fingerprint.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g., Summer Marketing Campaign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Company Logo</Label>
             <p className="text-xs text-muted-foreground -mt-1">Upload a clear, high-quality version of your logo. A PNG with a transparent background is best.</p>
            <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange} className="hidden" ref={fileInputRef} required={!logoFile}/>
            
            {!previewUrl && (
              <Button type="button" variant="outline" className="w-full" onClick={triggerFileSelect}>
                <UploadCloud className="mr-2" />
                Upload logo
              </Button>
            )}

            {previewUrl && (
              <div className="mt-2 rounded-md border p-2 flex justify-center items-center bg-card relative">
                <Image src={previewUrl} alt="Logo preview" width={80} height={80} className="object-contain" />
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
          <div className="space-y-2">
            <Label htmlFor="brand-description">Brand Description</Label>
            <Textarea
              id="brand-description"
              placeholder="e.g., We are a playful, modern tech brand that values simplicity and user-friendliness..."
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isCreating || !logoFile || !brandDescription || !projectName}>
              {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Create Project & Analyze Brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
