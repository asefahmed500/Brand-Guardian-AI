
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const tiers = [
    {
        name: "Free",
        price: "$0",
        priceDescription: "/month",
        description: "For individuals and hobbyists starting out.",
        features: [
            "Basic Brand Checking",
            "5 Design Analyses/month",
            "Community Support"
        ],
        cta: "Get Started",
        href: "/signup",
        popular: false
    },
    {
        name: "Pro",
        price: "$25",
        priceDescription: "/month",
        description: "For professionals and small teams.",
        features: [
            "Advanced AI Features",
            "Intelligent Template Generation",
            "100 Design Analyses/month",
            "Email & Chat Support"
        ],
        cta: "Upgrade to Pro",
        href: "/signup",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        priceDescription: "",
        description: "For large organizations with custom needs.",
        features: [
            "All Pro Features",
            "Unlimited Analyses",
            "Custom Brand Training",
            "Dedicated Support & Onboarding"
        ],
        cta: "Contact Sales",
        href: "#",
        popular: false
    }
]

export default function PricingPage() {
    return (
        <div className="bg-background">
            <LandingNavbar />
            <main>
                <section id="pricing" className="py-24 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold font-headline">Find the perfect plan</h2>
                            <p className="text-lg text-muted-foreground mt-4">
                                Start for free, or unlock powerful features to keep your entire organization on-brand.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {tiers.map((tier) => (
                                <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                                    <CardHeader className="relative">
                                        {tier.popular && <Badge className="absolute top-[-1rem] right-6">Most Popular</Badge>}
                                        <CardTitle className="font-headline">{tier.name}</CardTitle>
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold">{tier.price}</span>
                                            {tier.priceDescription && <span className="text-muted-foreground ml-1">{tier.priceDescription}</span>}
                                        </div>
                                        <CardDescription>{tier.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <ul className="space-y-4">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-center">
                                                    <Check className="h-5 w-5 text-accent mr-2" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                                            <Link href={tier.href}>{tier.cta}</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </div>
    )
}
