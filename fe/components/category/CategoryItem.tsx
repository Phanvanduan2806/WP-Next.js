import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Category } from "@/services/category.service";

interface CategoryItemProps {
  category: Category;
}

export default function CategoryItem({
  category,
}: CategoryItemProps) {
  return (
    <li>
      <Link
        href={`/category/${category.slug}`}
        className="group flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
      >
        {category.image.url ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md">
            <Image
              src={category.image.url}
              alt={category.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-muted">
            <span className="text-xs text-muted-foreground">
              No image
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="font-medium">
            {category.name}
          </h2>

          {category.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {category.count} bài viết
          </p>
        </div>

        <ArrowRight
          className="
            mt-1
            size-4
            shrink-0
            text-muted-foreground
            transition-transform
            group-hover:translate-x-1
            group-hover:text-foreground
          "
        />
      </Link>
    </li>
  );
}