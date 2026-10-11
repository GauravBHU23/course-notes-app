import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { ExamCategory } from "@/types/domain";

export function CategoryCard({ category }: { category: ExamCategory }) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-600/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-xl font-bold text-brand-700">
          {category.name.charAt(0)}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-brand-700">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{category.description}</p>
        )}
        <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-600">
          Explore bundles →
        </span>
      </Card>
    </Link>
  );
}
