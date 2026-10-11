import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActiveBanners } from "@/components/marketing/ActiveBanners";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ActiveBanners />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
