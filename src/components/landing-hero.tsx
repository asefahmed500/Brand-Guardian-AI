
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Palette, Bot, ShieldCheck, Type, LayoutGrid } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

const icons = [
    { icon: <Palette className="h-10 w-10" />, x: '10%', y: '20%' },
    { icon: <Bot className="h-12 w-12" />, x: '80%', y: '15%' },
    { icon: <Type className="h-9 w-9" />, x: '30%', y: '85%' },
    { icon: <ShieldCheck className="h-16 w-16" />, x: '50%', y: '50%' },
    { icon: <LayoutGrid className="h-11 w-11" />, x: '85%', y: '75%' },
    { icon: <Sparkles className="h-9 w-9" />, x: '15%', y: '60%' }
];

export function LandingHero() {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
        <section ref={ref} className="relative py-20 md:py-28 bg-background overflow-hidden">
             <div 
                className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[150%] h-[150%] opacity-[0.08]"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 50%)'
                }}
            />
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div className={cn("text-left transition-all duration-1000 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                        <div className="inline-flex items-center gap-2 bg-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                           <Sparkles className="h-4 w-4 text-primary" />
                           <span>Powered by Genkit & Gemini</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight mb-6">
                            Stay On-Brand, Effortlessly.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-10">
                            Brand Guardian is an AI assistant that provides real-time compliance scoring and one-click fixes, all within a native Adobe Express panel.
                        </p>
                        <div className="flex justify-start items-center gap-4">
                            <Button size="lg" asChild className="group">
                                <Link href="/signup">
                                    Get Started for Free
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                             <Button size="lg" variant="outline" asChild>
                                <Link href="#features">
                                    Learn More
                                </Link>
                            </Button>
                        </div>
                    </div>
                     <div className={cn("relative transition-all duration-1000 ease-out delay-300", inView ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
                        <div className="relative aspect-square md:aspect-[4/3] rounded-xl shadow-2xl border border-white/10 bg-black/50 p-4 overflow-hidden">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(var(--primary-rgb),0.1)_0%,_transparent_50%)]" />
                             {icons.map((item, index) => (
                                <div
                                    key={index}
                                    className="absolute rounded-full bg-white/5 border border-white/10 p-4 text-white/80"
                                    style={{
                                        left: item.x,
                                        top: item.y,
                                        transform: 'translate(-50%, -50%)',
                                        transition: `all 1s ease ${index * 100}ms`,
                                        opacity: inView ? 1 : 0,
                                        transform: `translate(-50%, -50%) scale(${inView ? 1 : 0.8})`,
                                    }}
                                >
                                    {item.icon}
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
