
'use client';

import { Bot, Palette, LayoutTemplate, Sparkles, ShieldCheck, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const features = [
    {
        icon: <Bot className="h-8 w-8" />,
        title: "AI Brand Analysis",
        description: "Our AI learns your color palette, typography, and layout preferences to create a unique brand fingerprint.",
    },
    {
        icon: <ShieldCheck className="h-8 w-8" />,
        title: "Real-Time Compliance",
        description: "Get instant feedback with a 0-100 compliance score directly in the Adobe Express panel as you design.",
    },
    {
        icon: <Sparkles className="h-8 w-8" />,
        title: "One-Click Fixes",
        description: "Correct brand deviations with a single click or generate a library of on-brand templates for your team to use.",
    },
    {
        icon: <MessageSquare className="h-8 w-8" />,
        title: "Seamless Collaboration",
        description: "Brand Managers can modify guidelines, and the changes are instantly reflected for all designers.",
    },
];

export function LandingFeatures() {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });
    
    return (
        <section id="features" ref={ref} className="py-24 md:py-32">
            <div className={cn("container mx-auto px-4 transition-all duration-1000 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Everything you need to maintain brand consistency.</h2>
                    <p className="text-lg text-muted-foreground mt-4">
                        From automated analysis to one-click fixes, Brand Guardian AI streamlines your creative workflow and empowers your entire team.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                         <Card key={feature.title} className={cn("text-left p-2 bg-background/50 backdrop-blur-sm border-white/10 transition-all duration-700 ease-out transform hover:-translate-y-2 hover:shadow-primary/10 hover:shadow-2xl", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")} style={{transitionDelay: `${index * 150}ms`}}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                    {feature.icon}
                                </div>
                                <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                     ))}
                </div>
            </div>
        </section>
    );
}
