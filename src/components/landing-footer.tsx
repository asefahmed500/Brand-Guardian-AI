
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="border-t border-white/10 bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Your intelligent brand compliance assistant. Stay on-brand, effortlessly.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-foreground/90">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Changelog</Link></li>
                            </ul>
                        </div>
                         <div className="space-y-3">
                            <h4 className="font-semibold text-foreground/90">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">About</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                            </ul>
                        </div>
                         <div className="space-y-3">
                            <h4 className="font-semibold text-foreground/90">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Brand Guardian AI. All rights reserved.
                    </p>
                     <div className="flex items-center space-x-1">
                         <Button variant="ghost" size="icon" asChild>
                            <a href="https://github.com/firebase/genkit/tree/main/firebase-studio-samples/brand-guardian-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            </a>
                        </Button>
                         <Button variant="ghost" size="icon" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            </a>
                        </Button>
                         <Button variant="ghost" size="icon" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
