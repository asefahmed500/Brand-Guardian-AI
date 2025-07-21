
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function NotificationsPanel() {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications from us.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="weekly-reports" className="font-medium">Weekly Reports</Label>
                        <p className="text-xs text-muted-foreground">Receive a summary of your brand compliance activity.</p>
                    </div>
                    <Switch id="weekly-reports" defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="brand-updates" className="font-medium">Brand Guideline Updates</Label>
                        <p className="text-xs text-muted-foreground">Get notified when a Brand Manager updates guidelines.</p>
                    </div>
                    <Switch id="brand-updates" defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <Label htmlFor="product-news" className="font-medium">Product News</Label>
                        <p className="text-xs text-muted-foreground">Stay up to date with new features and announcements.</p>
                    </div>
                    <Switch id="product-news" />
                </div>
            </CardContent>
        </Card>
    )
}
