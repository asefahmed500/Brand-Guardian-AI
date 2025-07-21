
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './logo';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { handleSignUp } from '@/lib/actions';

interface AuthFormProps {
    mode: 'login' | 'signup';
}

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.31v2.84C4.22 20.98 7.82 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.31c-.65 1.28-1.02 2.73-1.02 4.34s.37 3.06 1.02 4.34l3.53-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.82 1 4.22 3.02 2.31 5.93l3.53 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isLogin = mode === 'login';
  const title = isLogin ? 'Welcome Back' : 'Create an Account';
  const description = isLogin ? 'Sign in to manage your brand compliance.' : 'Sign up to get started.';
  const buttonText = isLogin ? 'Sign In' : 'Sign Up';
  const linkText = isLogin ? "Don't have an account?" : 'Already have an account?';
  const linkHref = isLogin ? '/signup' : '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.error,
        });
      } else {
        router.push('/dashboard');
      }

    } else { // Sign up
        try {
            await handleSignUp({ email, password });
            toast({
                title: 'Account Created',
                description: 'Please sign in to continue.',
            });
            router.push('/login');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        }
    }
    setIsLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="mx-auto mb-4">
              <Logo />
            </Link>
            <CardTitle className="text-2xl font-bold font-headline">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                        <Button variant="link" size="sm" className="h-auto p-0" asChild>
                            <Link href="/forgot-password">
                                Forgot Password?
                            </Link>
                        </Button>
                    )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                {buttonText}
              </Button>
            </form>
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-muted" />
              <span className="mx-4 text-xs uppercase text-muted-foreground">Or</span>
              <div className="flex-grow border-t border-muted" />
            </div>
             <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
             <div className="mt-4 text-center text-sm">
                {linkText}
                <Button variant="link" size="sm" asChild>
                    <Link href={linkHref}>
                       {isLogin ? 'Sign Up' : 'Sign In'}
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
