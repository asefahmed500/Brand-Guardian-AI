
'use client';

import { useState, useTransition, FormEvent } from 'react';
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
import { Loader2, Save, Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Design } from '@/lib/types';
import { handleTagDesign } from '@/lib/actions';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface DesignTagsDialogProps {
  design: Design;
}

export function DesignTagsDialog({ design }: DesignTagsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(design.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddTag = () => {
    const formattedTag = currentTag.trim();
    if (formattedTag && !tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        await handleTagDesign({ designId: design._id, tags });
        toast({
          title: 'Tags Saved',
          description: 'Your tags for this design have been updated.',
        });
        setOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTags(design.tags || []); // Reset tags on close
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Tag className={`h-4 w-4 ${design.tags?.length > 0 ? 'text-primary' : ''}`} />
          <span className="sr-only">Manage Tags</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Design Tags</DialogTitle>
          <DialogDescription>
            Add or remove tags to organize this design. Press Enter to add a tag.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="design-tags">Add a tag</Label>
                <div className="flex gap-2">
                    <Input
                        id="design-tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., LinkedIn, Q3 Campaign"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-16 bg-muted/50">
                    {tags.length > 0 ? tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-sm">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="rounded-full hover:bg-destructive/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )) : (
                        <p className="text-sm text-muted-foreground p-2">No tags yet.</p>
                    )}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
