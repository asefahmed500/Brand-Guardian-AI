
import { NewProjectDialog } from '@/components/new-project-dialog';
import { ProjectList } from '@/components/project-list';
import { getProjectsForUser } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    // This should theoretically not be reached if middleware is set up,
    // but it's good practice for defense-in-depth.
    redirect('/');
  }
  
  const projects = await getProjectsForUser(userId);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Projects</h1>
          <p className="text-muted-foreground">Manage your brands and design assets.</p>
        </div>
        <NewProjectDialog />
      </div>
      
      <ProjectList projects={projects} />
    </div>
  );
}
