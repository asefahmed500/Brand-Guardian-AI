
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './logo';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleResetPassword } from '@/lib/actions';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        toast({
            variant: 'destructive',
            title: 'Invalid Link',
            description: 'The password reset link is missing a token.',
        });
        return;
    }
    setIsLoading(true);

    try {
        await handleResetPassword(token, password);
        toast({
            title: 'Password Reset',
            description: 'Your password has been successfully updated. Please sign in.',
        });
        router.push('/login');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Reset Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (!token) {
    return (
         <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <Link href="/" className="mx-auto mb-4">
                            <Logo />
                        </Link>
                        <CardTitle className="text-2xl font-bold font-headline text-destructive">Invalid Reset Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired. Please request a new one.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button variant="outline" className="w-full" asChild>
                           <Link href="/forgot-password">Request a new link</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="mx-auto mb-4">
              <Logo />
            </Link>
            <CardTitle className="text-2xl font-bold font-headline">Reset Your Password</CardTitle>
            <CardDescription>
              Enter a new password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                Reset Password
              </Button>
            </form>
             <div className="mt-4 text-center text-sm">
                <Button variant="link" size="sm" asChild>
                    <Link href="/login">
                       Back to Sign In
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
