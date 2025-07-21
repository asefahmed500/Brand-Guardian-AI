
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    analyses: number;
}

interface AdminAnalyticsChartProps {
    data: ChartData[];
}

export function AdminAnalyticsChart({ data }: AdminAnalyticsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                <p>No analytics data available yet.</p>
            </div>
        )
    }
    
    return (
        <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                        }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="analyses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Monthly Analyses" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
