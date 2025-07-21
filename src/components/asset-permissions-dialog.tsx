
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
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Settings, Lock, Users, Save, Loader2 } from 'lucide-react';

interface AssetPermissionsDialogProps {
  assetName: string;
}

export function AssetPermissionsDialog({ assetName }: AssetPermissionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Permissions Updated',
        description: `Permissions for "${assetName}" have been saved.`,
      });
      setIsSaving(false);
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asset Permissions</DialogTitle>
          <DialogDescription>
            Manage usage permissions for "{assetName}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Lock className="text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="read-only" className="font-medium">Read-only</Label>
              <p className="text-xs text-muted-foreground">
                Users can view and use this asset, but cannot edit or delete it.
              </p>
            </div>
            <Checkbox id="read-only" />
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Users className="text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="requires-approval" className="font-medium">Requires Approval</Label>
              <p className="text-xs text-muted-foreground">
                Designs using this asset must be approved by a Brand Manager.
              </p>
            </div>
             <Checkbox id="requires-approval" />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Save Permissions
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
