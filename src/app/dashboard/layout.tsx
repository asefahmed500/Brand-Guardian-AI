
'use client';

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, LogOut, FolderKanban, Shield, Crown, Loader2, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
         <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    redirect('/login');
  }

  const isAdmin = session?.user?.role === 'admin';
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r" collapsible="icon">
          <SidebarHeader className="border-b p-2">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2 flex flex-col justify-between">
            <SidebarMenu>
              <SidebarMenuItem>
                 <SidebarMenuButton asChild variant="outline" isActive={isActive('/dashboard') && pathname === '/dashboard'}>
                    <Link href="/dashboard">
                        <FolderKanban />
                        All Projects
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" isActive={isActive('/admin')}>
                      <Link href="/admin">
                          <Shield />
                          Admin Panel
                      </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>

             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild variant="ghost" isActive={isActive('/dashboard/settings')}>
                        <Link href="/dashboard/settings">
                            <Settings />
                            Settings
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>

          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-[60px] items-center justify-between border-b px-6">
            <div>
              {session.user.subscriptionPlan && (
                <Badge variant={session.user.subscriptionPlan === 'pro' ? 'default' : 'secondary'}>
                  <Crown className="mr-2 h-4 w-4" />
                  {session.user.subscriptionPlan.charAt(0).toUpperCase() + session.user.subscriptionPlan.slice(1)} Plan
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/firebase/genkit/tree/main/firebase-studio-samples/brand-guardian-ai" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <form action={async () => {
                await signOut({ callbackUrl: '/' });
              }}>
                <Button variant="outline" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
              <Avatar>
                <AvatarImage src={session.user?.image ?? `https://placehold.co/40x40.png`} alt="User avatar" data-ai-hint="user avatar" />
                <AvatarFallback>{session.user?.name?.[0].toUpperCase() ?? session.user?.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
