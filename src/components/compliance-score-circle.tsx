
'use client';

import { useEffect, useState } from 'react';

interface ComplianceScoreCircleProps {
  score: number;
  className?: string;
}

export function ComplianceScoreCircle({ score, className }: ComplianceScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target score
    let start = 0;
    const end = score;
    if (start === end) {
      setDisplayScore(end);
      return;
    };

    let startTime: number;
    const duration = 1000; // 1 second animation

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayScore(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);

  }, [score]);

  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = 'hsl(var(--destructive))';
  if (score >= 80) {
    color = 'hsl(var(--chart-2))';
  } else if (score >= 50) {
    color = 'hsl(var(--accent))';
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-card"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          strokeWidth={strokeWidth}
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ strokeDashoffset: offset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-headline" style={{ color: color }}>
          {displayScore}
        </span>
        <span className="text-sm text-muted-foreground">Compliance</span>
      </div>
    </div>
  );
}
