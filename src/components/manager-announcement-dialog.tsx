
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
import { Loader2, Megaphone, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export function ManagerAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;
    setIsSending(true);

    // In a real app, this would call a server action to send a notification
    // to all users in the project. We are simulating it here.
    setTimeout(() => {
      toast({
        title: 'Announcement Sent',
        description: 'Your announcement has been posted for the team.',
      });
      setIsSending(false);
      setOpen(false);
      setAnnouncement('');
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Megaphone className="mr-2" />
          New Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Post an announcement for everyone in this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-text">Message</Label>
            <Textarea
              id="announcement-text"
              placeholder="e.g., Please use the new Q3 presentation templates, now available in the library."
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={5}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSending || !announcement}>
              {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
              Post Announcement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
