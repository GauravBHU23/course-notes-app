import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Profile | ExamPrep Store" };

export default async function ProfilePage() {
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const { profile } = current;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Your profile</h1>

      <Card className="max-w-lg p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-foreground/50">Full name</p>
            <p className="font-medium">{profile.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Email</p>
            <p className="font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Mobile number</p>
            <p className="font-medium">{profile.mobile ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Account status</p>
            <Badge tone="success" className="mt-1">
              Active
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="max-w-lg p-6">
        <h2 className="mb-2 font-semibold">Security notice</h2>
        <p className="text-sm text-foreground/60">
          Your account can only be signed in from one device at a time. Logging in from a new device or browser
          will automatically sign you out everywhere else.
        </p>
      </Card>
    </div>
  );
}
