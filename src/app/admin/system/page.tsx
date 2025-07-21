
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Mail, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const configSections = [
    {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: "Brand Compliance Rules",
        description: "Set global thresholds for compliance scoring and define universal style rules.",
        link: "#"
    },
    {
        icon: <Mail className="h-6 w-6" />,
        title: "Email Templates",
        description: "Customize the content of password reset emails, weekly reports, and other notifications.",
        link: "#"
    },
    {
        icon: <KeyRound className="h-6 w-6" />,
        title: "API & Integrations",
        description: "Manage API keys for external services and configure the Adobe Express integration.",
        link: "#"
    }
];

export default function SystemConfigPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <Wrench className="text-primary" />
                        System Configuration
                    </h1>
                    <p className="text-muted-foreground">Manage global settings for the entire application.</p>
                </div>
                <Button asChild>
                    <Link href="/admin">Back to Admin Dashboard</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configSections.map((section) => (
                    <Card key={section.title}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            {section.icon}
                            <CardTitle>{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{section.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Feature In Development</CardTitle>
                    <CardDescription>This area is a placeholder to demonstrate where system-wide configurations would be managed by an Administrator. Full implementation of these settings is beyond the scope of this demo.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
