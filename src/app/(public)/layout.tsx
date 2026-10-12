import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActiveBanners } from "@/components/marketing/ActiveBanners";
import { ContentProtection } from "@/components/layout/ContentProtection";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentProfile("student");

  return (
    <div className="flex min-h-screen flex-col">
      <ContentProtection />
      <ActiveBanners />
      <Header isLoggedIn={!!current} userName={current?.profile.full_name} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
