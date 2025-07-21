
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { User } from "@/lib/types";
import { useState } from "react";
import { Loader2, Save, Award, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleUpdateUser } from "@/lib/actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ProfilePanelProps {
    user: User;
}

const achievementConfig = {
    'first-5-designs': {
        icon: <Award className="h-5 w-5 text-blue-500" />,
        title: 'Getting Started',
        description: 'Uploaded your first 5 designs.'
    },
    'high-scorer-streak': {
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        title: 'High Scorer',
        description: 'Achieved a score of 90+ three times in a row.'
    },
    'one-click-fixer': {
        icon: <Zap className="h-5 w-5 text-green-500" />,
        title: 'Quick Fixer',
        description: 'Used the "Instant Brandify" feature to fix a design.'
    }
}

export function ProfilePanel({ user }: ProfilePanelProps) {
    const [name, setName] = useState(user.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await handleUpdateUser({ name });
            toast({
                title: 'Profile Updated',
                description: 'Your name has been updated successfully.',
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>This is how your name appears in the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email || ''} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label>Achievements</Label>
                        <div className="flex gap-4 p-4 border rounded-lg bg-secondary/50">
                            {Object.entries(achievementConfig).map(([key, config]) => (
                                <TooltipProvider key={key}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className={`p-2 rounded-full ${user.achievements.includes(key) ? 'bg-background' : 'opacity-30 grayscale'}`}>
                                               {config.icon}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">{config.title}</p>
                                            <p className="text-sm text-muted-foreground">{config.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading || name === user.name}>
                         {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
