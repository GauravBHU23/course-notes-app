import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/icons/CategoryIcons";
import type { ExamCategory } from "@/types/domain";

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

export function CategoryCard({ category }: { category: ExamCategory }) {
  const gradient = gradientFor(category.slug);

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group h-full overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
        <div className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
          {category.icon_url ? (
            <Image
              src={category.icon_url}
              alt=""
              width={56}
              height={56}
              className="relative h-14 w-14 rounded-xl bg-white/15 object-contain p-2 backdrop-blur-sm"
            />
          ) : (
            <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
              <CategoryIcon slug={category.slug} className="h-7 w-7" />
            </span>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-700">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{category.description}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            Explore bundles
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
