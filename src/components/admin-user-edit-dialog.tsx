
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { handleUpdateUserByAdmin } from '@/lib/actions';

interface AdminUserEditDialogProps {
  user: User;
}

export function AdminUserEditDialog({ user }: AdminUserEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState(user.subscriptionPlan);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setRole(user.role);
      setPlan(user.subscriptionPlan);
    }
  }, [open, user]);

  const hasChanges = role !== user.role || plan !== user.subscriptionPlan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await handleUpdateUserByAdmin({ 
        userId: user._id, 
        role: role, 
        subscriptionPlan: plan 
      });

      toast({
        title: 'User Updated',
        description: `${user.name || user.email}'s profile has been updated.`,
      });
      router.refresh();
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Modify the role and subscription plan for {user.name || user.email}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="brand_manager">Brand Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-select">Subscription Plan</Label>
            <Select value={plan} onValueChange={(value) => setPlan(value as User['subscriptionPlan'])}>
              <SelectTrigger id="plan-select">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUpdating || !hasChanges}>
              {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
