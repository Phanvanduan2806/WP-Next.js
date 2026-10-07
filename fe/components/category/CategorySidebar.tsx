"use client";

import Link from "next/link";

import { useCategories } from "@/hooks/useCategories";

export default function CategorySidebar() {
  const {
    categories,
    loading,
    error,
  } = useCategories();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Không thể tải chuyên mục.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((item) => (
        <Link
          key={item.id}
          href={`/category/${item.slug}`}
          className="block rounded-lg border p-4 transition-colors hover:bg-muted"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold">
              {item.name}
            </h3>

            <span className="shrink-0 text-sm text-muted-foreground">
              {item.count} Bài viết
            </span>
          </div>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}