
'use client';

import type { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import Link from "next/link";
import { Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BillingPanelProps {
    user: User;
}

export function BillingPanel({ user }: BillingPanelProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const planName = user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1);
    const usagePercentage = user.analysisLimit > 0 ? (user.monthlyAnalysisCount / user.analysisLimit) * 100 : 0;
    const isPro = user.subscriptionPlan === 'pro';

    const handleSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout-session', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const session = await response.json();
            window.location.href = session.url;

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong.',
                description: 'Please try again later.',
            });
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Crown className="text-primary" />
                    Subscription Plan
                </CardTitle>
                <CardDescription>You are currently on the <span className="font-semibold text-foreground">{planName}</span> plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium">Monthly Analysis Usage</p>
                        <p className="text-sm text-muted-foreground">
                            {user.monthlyAnalysisCount} / {user.analysisLimit === -1 ? 'Unlimited' : user.analysisLimit}
                        </p>
                    </div>
                    {user.analysisLimit > 0 && <Progress value={usagePercentage} />}
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{isPro ? "Manage your billing and subscription." : "Upgrade to unlock powerful features."}</p>
                <Button onClick={handleSubscription} variant={isPro ? 'outline' : 'default'} disabled={isLoading}>
                    {isLoading && <Loader2 className="animate-spin mr-2"/>}
                    {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                </Button>
            </CardFooter>
        </Card>
    );
}
