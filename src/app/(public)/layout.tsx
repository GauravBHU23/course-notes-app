import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActiveBanners } from "@/components/marketing/ActiveBanners";
import { ContentProtection } from "@/components/layout/ContentProtection";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ContentProtection />
      <ActiveBanners />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
