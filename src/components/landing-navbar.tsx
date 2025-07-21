
'use client';

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";

export function LandingNavbar() {
    const { status } = useSession();
    const isLoading = status === 'loading';
    const isSignedIn = status === 'authenticated';

    return (
        <nav className="fixed top-0 w-full h-16 px-4 md:px-8 bg-background/60 backdrop-blur-md flex items-center justify-between z-50 border-b border-white/10">
            <Link href="/">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center gap-x-2">
                 <Button asChild variant="ghost">
                    <Link href="/#features">Features</Link>
                </Button>
                <Button asChild variant="ghost">
                    <Link href="/pricing">Pricing</Link>
                </Button>
            </div>
            <div className="flex items-center gap-x-4">
                {isLoading ? (
                     <div className="flex items-center justify-center w-28 h-9">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                     </div>
                ) : isSignedIn ? (
                    <Button asChild>
                      <Link href="/dashboard">
                          Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                ) : (
                    <>
                        <Button asChild variant="ghost">
                            <Link href="/login">
                                Sign In
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">
                                Sign Up Free
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}
