import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { createAdminClient } from "@/lib/supabase/admin";
import { SecureViewer } from "@/components/pdf-viewer/SecureViewer";
import { Card } from "@/components/ui/Card";

export default async function PdfViewerPage({ params }: { params: Promise<{ pdfId: string }> }) {
  const { pdfId } = await params;
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const supabase = createAdminClient();
  const { data: pdf } = await supabase.from("pdfs").select("title").eq("id", pdfId).maybeSingle();

  if (!pdf) {
    return (
      <Card className="p-8 text-center text-sm text-foreground/60">
        This document could not be found.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">{pdf.title}</h1>
      <Card className="overflow-hidden p-0">
        <SecureViewer
          pdfId={pdfId}
          viewer={{
            fullName: current.profile.full_name,
            email: current.profile.email,
            mobile: current.profile.mobile,
          }}
        />
      </Card>
      <p className="text-xs text-foreground/50">
        This document is for your personal use only and is watermarked with your account details.
        Downloading or redistributing this content is prohibited.
      </p>
    </div>
  );
}
