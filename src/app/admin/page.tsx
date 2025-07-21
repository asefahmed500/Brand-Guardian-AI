
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart2, Palette, DollarSign, Wrench, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { getAllUsers } from '@/lib/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminAnalyticsChart } from '@/components/admin-analytics-chart';
import type { User } from '@/lib/types';
import { AdminUserEditDialog } from '@/components/admin-user-edit-dialog';
import { Button } from '@/components/ui/button';

const adminFeatures = [
    {
        title: "Brand Guidelines",
        description: "Update brand assets and compliance rules.",
        icon: <Palette className="h-8 w-8 text-primary" />,
        href: "/dashboard" // All projects are on the dashboard
    },
    {
        title: "System Configuration",
        description: "Customize compliance rules and integrations.",
        icon: <Wrench className="h-8 w-8 text-primary" />,
        href: "/admin/system"
    },
    {
        title: "Financials & Subscriptions",
        description: "Monitor revenue and manage user plans.",
        icon: <DollarSign className="h-8 w-8 text-primary" />,
        href: "/admin/financials"
    }
];

function processAnalyticsData(users: User[]) {
    const usageByPlan: { [key: string]: number } = {
        free: 0,
        pro: 0,
        enterprise: 0,
    };

    users.forEach(user => {
        if (user.subscriptionPlan && usageByPlan.hasOwnProperty(user.subscriptionPlan)) {
            usageByPlan[user.subscriptionPlan] += user.monthlyAnalysisCount;
        }
    });

    return [
        { name: 'Free', analyses: usageByPlan.free },
        { name: 'Pro', analyses: usageByPlan.pro },
        { name: 'Enterprise', analyses: usageByPlan.enterprise },
    ];
}


export default async function AdminPage() {
  const users = await getAllUsers();
  const analyticsData = processAnalyticsData(users);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application, users, and brand settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Users className="h-6 w-6 text-primary" />
                    Total Users
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Across all subscription plans</p>
            </CardContent>
        </Card>
        {adminFeatures.map(feature => (
             <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <Link href={feature.href} className="block h-full">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        {feature.icon}
                        <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                </Link>
            </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-4">
                <BarChart2 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Analytics & Insights</CardTitle>
                  <CardDescription>Track brand compliance and usage across the organization.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <AdminAnalyticsChart data={analyticsData} />
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>The 5 most recently signed up users.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.slice(0, 5).map(user => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image ?? undefined} alt="User avatar" data-ai-hint="user avatar" />
                              <AvatarFallback>{user.name?.[0].toUpperCase() ?? user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AdminUserEditDialog user={user} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
       </div>
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                Coaching Corner
            </CardTitle>
            <CardDescription>AI-powered suggestions to improve your team's brand strategy.</CardDescription>
        </CardHeader>
        <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                Your team has a high compliance score for "Social Media Posts", but fewer analyses for "Business Presentations". Consider creating on-brand presentation templates to improve consistency in that area.
            </blockquote>
        </CardContent>
       </Card>
    </div>
  );
}
