
'use client';

import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card";
import { UploadCloud, ScanSearch, Wand2, CheckCircle, ArrowDown } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

const steps = [
    {
        icon: <UploadCloud className="h-8 w-8 text-primary" />,
        bigIcon: <UploadCloud className="h-16 w-16 text-primary/40" strokeWidth={1.5}/>,
        title: "Analyze Your Brand",
        description: "Upload your logo and provide a brief description. Our AI instantly analyzes your assets to create a unique 'brand fingerprint' that guides all future work.",
    },
    {
        icon: <ScanSearch className="h-8 w-8 text-primary" />,
        bigIcon: <ScanSearch className="h-16 w-16 text-primary/40" strokeWidth={1.5}/>,
        title: "Get Real-Time Scores",
        description: "As you create in Adobe Express, Brand Guardian scores your design in real-time, providing immediate feedback on brand compliance right on your canvas.",
    },
    {
        icon: <Wand2 className="h-8 w-8 text-primary" />,
        bigIcon: <Wand2 className="h-16 w-16 text-primary/40" strokeWidth={1.5}/>,
        title: "Apply One-Click Fixes",
        description: "Instantly correct color, typography, and layout issues with intelligent suggestions that bring your designs into perfect alignment with your brand.",
    },
];

export function LandingHowItWorks() {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
        <section id="how-it-works" ref={ref} className="py-24 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className={cn("text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
                    <p className="text-lg text-muted-foreground mt-4">
                        Go from messy concepts to brand-perfect assets in three simple steps.
                    </p>
                </div>
                <div className="space-y-16">
                    {steps.map((step, index) => (
                        <div key={step.title} className={cn("grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")} style={{transitionDelay: `${index * 200}ms`}}>
                            <div className={`space-y-4 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 bg-background text-primary rounded-full p-3 border">
                                        {step.icon}
                                    </div>
                                    <h3 className="font-headline text-2xl font-bold">{step.title}</h3>
                                </div>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                            <div className="relative aspect-video rounded-xl flex items-center justify-center bg-black/5 border border-white/10 p-4 shadow-inner overflow-hidden">
                               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_0%,_transparent_70%)]" />
                                <div className="relative h-48 w-48 rounded-full bg-black/5 flex items-center justify-center">
                                    {step.bigIcon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
