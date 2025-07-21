
import { ProfilePanel } from "@/components/settings-profile-panel";
import { BillingPanel } from "@/components/settings-billing-panel";
import { NotificationsPanel } from "@/components/settings-notifications-panel";
import { getUserSettings } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const user = await getUserSettings();
    if (!user) {
        // This case should be rare as the user is authenticated
        return <p>Could not load user settings.</p>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account, subscription, and preferences.</p>
            </div>
            
            <div className="space-y-6">
                <ProfilePanel user={user} />
                <BillingPanel user={user} />
                <NotificationsPanel />
            </div>
        </div>
    )
}
