
'use client';

import type { Project } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProjectSettingsDialog } from "./project-settings-dialog";

interface ProjectCardProps {
    project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Card className="flex flex-col group relative">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ProjectSettingsDialog project={project} />
            </div>
            <CardHeader>
                <div className="w-full aspect-video rounded-md bg-muted mb-4 flex items-center justify-center p-4 overflow-hidden">
                   {project.logoDataUri ? (
                     <Image 
                        src={project.logoDataUri} 
                        alt={`${project.name} logo`} 
                        width={120}
                        height={120}
                        className="object-contain"
                        data-ai-hint="company logo"
                    />
                   ) : <div className="w-24 h-24 bg-muted-foreground/20 rounded-full" />}
                </div>
                <CardTitle className="font-headline">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                   {project.brandDescription}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/dashboard/project/${project._id}`}>
                        Open Project
                        <ArrowRight className="ml-2"/>
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}


interface ProjectListProps {
    projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
    if (projects.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-auto text-center text-muted-foreground bg-card p-8 rounded-lg border-2 border-dashed">
                <Sparkles size={48} className="mb-4 text-primary" />
                <h2 className="text-2xl font-headline text-foreground">Welcome to Brand Guardian!</h2>
                <p className="mt-2 max-w-md">Let's create your first brand fingerprint.</p>
                <div className="mt-6 text-left bg-secondary/50 p-4 rounded-lg text-sm max-w-lg">
                    <h4 className="font-semibold text-foreground mb-2">What's a Brand Fingerprint?</h4>
                    <p className="text-xs">
                        It's an AI-generated set of rules based on your brand's core assets. To start, click "New Project" and upload your company's main logo. 
                        A high-quality <code className="bg-muted px-1 py-0.5 rounded">.png</code> with a transparent background works best! The AI will analyze it to define your colors, typography, and style.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <ProjectCard key={project._id} project={project} />
            ))}
        </div>
    )
}

    