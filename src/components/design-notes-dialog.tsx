
'use client';

import { useState, useTransition } from 'react';
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
import { Loader2, NotebookText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Textarea } from './ui/textarea';
import type { Design } from '@/lib/types';
import { handleAddNoteToDesign } from '@/lib/actions';
import { Label } from './ui/label';

interface DesignNotesDialogProps {
  design: Design;
}

export function DesignNotesDialog({ design }: DesignNotesDialogProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(design.notes || '');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const hasNotes = design.notes && design.notes.length > 0;

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        await handleAddNoteToDesign({ designId: design._id, notes: notes });
        toast({
          title: 'Note Saved',
          description: 'Your notes for this design have been updated.',
        });
        setOpen(false);
        // The server action revalidates the path, so a manual refresh is not needed.
        // This is more efficient than router.refresh().
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <NotebookText className={`h-4 w-4 ${hasNotes ? 'text-primary' : ''}`} />
          <span className="sr-only">View/Add Notes</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Design Journal</DialogTitle>
          <DialogDescription>
            Add or edit your personal notes for this design. Only you can see these.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="design-notes">Your Notes</Label>
                <Textarea
                    id="design-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Client liked this version but wants to see a different font for the headline..."
                    rows={6}
                />
            </div>
            <div className="text-sm p-3 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold mb-1">Original AI Feedback</h4>
                <p className="text-xs text-muted-foreground italic">"{design.feedback}"</p>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
