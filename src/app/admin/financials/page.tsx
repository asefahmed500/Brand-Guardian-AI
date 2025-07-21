
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BarChartHorizontal, CreditCard, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const financialSections = [
    {
        icon: <BarChartHorizontal className="h-6 w-6" />,
        title: "Revenue Analytics",
        description: "View MRR, churn rate, and lifetime value. (Connect to Stripe)",
    },
    {
        icon: <CreditCard className="h-6 w-6" />,
        title: "Subscription Management",
        description: "Manage individual user subscriptions, process refunds, and view billing history.",
    },
    {
        icon: <Receipt className="h-6 w-6" />,
        title: "Invoices & Payments",
        description: "Monitor payment statuses, handle failed payments, and generate invoices.",
    }
];

export default function FinancialsPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <DollarSign className="text-primary" />
                        Financials & Subscriptions
                    </h1>
                    <p className="text-muted-foreground">Monitor revenue and manage customer billing.</p>
                </div>
                 <Button asChild>
                    <Link href="/admin">Back to Admin Dashboard</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {financialSections.map((section) => (
                    <Card key={section.title}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            {section.icon}
                            <CardTitle>{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{section.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Feature In Development</CardTitle>
                    <CardDescription>This area is a placeholder to demonstrate where financial reporting and subscription management would occur. A full integration with a payment provider like Stripe is required for this functionality.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
