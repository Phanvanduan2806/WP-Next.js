"use client";

import { useCategories } from "@/hooks/useCategories";

import CategoryItem from "./CategoryItem";

export default function Categories() {
  const {
    categories,
    loading,
    error,
  } = useCategories();

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có chuyên mục nào.
        </p>
      </div>
    );
  }

  return (
    <nav aria-label="Danh mục bài viết">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
          />
        ))}
      </ul>
    </nav>
  );
}