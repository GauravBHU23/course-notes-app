import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/icons/CategoryIcons";
import { formatPriceInr, formatValidity } from "@/lib/utils/format";
import type { BundlePublic } from "@/types/domain";

const gradients = [
  "from-brand-500 to-accent-500",
  "from-indigo-500 to-brand-500",
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-brand-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

function gradientFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return gradients[hash % gradients.length];
}

export function BundleCard({ bundle }: { bundle: BundlePublic }) {
  const gradient = gradientFor(bundle.slug);

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
      <div className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
        {bundle.cover_image_url ? (
          <Image
            src={bundle.cover_image_url}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
            <CategoryIcon slug={bundle.category_slug} className="h-7 w-7" />
          </span>
        )}
        <Badge tone="neutral" className="absolute left-3 top-3 bg-white/90 text-foreground backdrop-blur-sm">
          {bundle.category_name}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-700">
          {bundle.title}
        </h3>
        {bundle.description && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-foreground/60">
            {bundle.description}
          </p>
        )}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPriceInr(bundle.price_inr)}
          </span>
          <span className="text-sm text-foreground/50">/ {formatValidity(bundle.validity_days)}</span>
        </div>
        <Link href={`/bundles/${bundle.slug}`} className="mt-5">
          <Button variant="primary" size="md" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
