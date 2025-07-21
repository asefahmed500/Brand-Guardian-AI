
'use client';

import { ResetPasswordForm } from "@/components/reset-password-form";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";


function ResetPasswordLoading() {
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
                            Verifying your reset link...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-24">
                        <Loader2 className="animate-spin h-8 w-8 text-primary"/>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
