import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export const metadata = { title: "Profile | Course and Notes Purchasing App" };

export default async function ProfilePage() {
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const { profile } = current;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Your profile</h1>
        <p className="text-sm text-foreground/60">Manage your account details and security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <EditProfileForm
            initialFullName={profile.full_name}
            email={profile.email}
            initialMobile={profile.mobile ?? ""}
          />
          <ChangePasswordForm />
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <h2 className="font-semibold">Account status</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="text-xs text-foreground/50">Status</p>
                <Badge tone="success" className="mt-1">
                  Active
                </Badge>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Member since</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-semibold">Security notice</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Your account can only be signed in from one device at a time. Logging in from a new
              device or browser will automatically sign you out everywhere else.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
