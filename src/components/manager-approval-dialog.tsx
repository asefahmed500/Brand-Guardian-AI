'use client';

import { useState } from 'react';
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
import { Loader2, Check, X, FilePenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Design } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { handleUpdateDesignStatus } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ManagerApprovalDialogProps {
  design: Design;
}

export function ManagerApprovalDialog({ design }: ManagerApprovalDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !feedback.trim()) {
        toast({
            variant: 'destructive',
            title: 'Feedback Required',
            description: 'Please provide feedback when rejecting a design.',
        });
        return;
    }
    setIsSubmitting(true);

    try {
        await handleUpdateDesignStatus({
            designId: design._id,
            status: status,
            managerFeedback: feedback
        });

        toast({
            title: `Design ${status}`,
            description: `The design has been successfully marked as ${status}.`,
        });
        router.refresh();
        setOpen(false);
        setFeedback('');

    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FilePenLine className="mr-2 h-3 w-3" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Design</DialogTitle>
          <DialogDescription>
            Approve or reject this design submitted by {design.userName || 'the designer'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="rounded-md border p-2 bg-card flex items-center justify-center">
                <Image 
                    src={design.originalImageUrl} 
                    alt="Design for review"
                    width={200}
                    height={150}
                    className="object-contain rounded"
                    data-ai-hint="design image"
                />
            </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-text">Feedback / Comments (Required for rejection)</Label>
            <Textarea
              id="feedback-text"
              placeholder="e.g., Great start, but let's try using the secondary color palette for the background."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
           <p className="text-xs text-muted-foreground">Original AI Feedback: "{design.feedback}"</p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
            <Button 
                variant="outline" 
                className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-destructive/50"
                disabled={isSubmitting}
                onClick={() => handleSubmit('rejected')}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <X className="mr-2" />}
              Reject
            </Button>
            <Button 
                className="w-full bg-green-600/10 text-green-600 hover:bg-green-600/20 hover:text-green-500 border-green-600/50"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleSubmit('approved')}
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Check className="mr-2" />}
                Approve
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
