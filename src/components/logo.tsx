import { ShieldCheck } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Brand Guardian AI">
      <ShieldCheck className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold font-headline text-foreground tracking-tight">
        Brand<span className="text-primary/90">Guardian</span>
      </h1>
    </div>
  );
}
