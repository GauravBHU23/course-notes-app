"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EditProfileFormProps {
  initialFullName: string;
  email: string;
  initialMobile: string;
}

export function EditProfileForm({ initialFullName, email, initialMobile }: EditProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = fullName.trim() !== initialFullName || mobile.trim() !== initialMobile;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), mobile: mobile.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Could not update profile.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Profile updated successfully!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold">Edit profile</h2>
      <p className="mt-1 text-sm text-foreground/60">Update your name and mobile number.</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" value={email} disabled className="cursor-not-allowed opacity-60" />
        <Input
          label="Mobile number"
          placeholder="9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} disabled={!dirty || !fullName.trim()} className="self-start">
          Save changes
        </Button>
      </form>
    </Card>
  );
}
