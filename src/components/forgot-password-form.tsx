
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
import { handleForgotPassword } from '@/lib/actions';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await handleForgotPassword(email);
        setIsSubmitted(true);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Request Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <Link href="/" className="mx-auto mb-4">
                            <Logo />
                        </Link>
                        <CardTitle className="text-2xl font-bold font-headline">Check your inbox</CardTitle>
                        <CardDescription>
                            If an account exists for {email}, a password reset link has been sent.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" asChild>
                           <Link href="/login">Back to Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="mx-auto mb-4">
              <Logo />
            </Link>
            <CardTitle className="text-2xl font-bold font-headline">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                Send Reset Instructions
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
