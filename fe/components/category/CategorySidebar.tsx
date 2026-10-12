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

  if (!categories.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có chuyên mục nào.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="block rounded-lg border p-4 transition-colors hover:bg-muted"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold">
              {category.name}
            </h3>

            <span className="shrink-0 text-sm text-muted-foreground">
              {category.count} bài viết
            </span>
          </div>

          {category.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}