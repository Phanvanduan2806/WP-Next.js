import Image from "next/image";

import CategorySidebar from "@/components/category/CategorySidebar";
import type { CategoryItem } from "@/services/types/category";
import type { PostItem } from "@/services/types/post";

import CategoryPostCard from "./CategoryPostCard";

interface CategoryDetailProps {
  category: CategoryItem;
  posts: PostItem[];
}

export default function CategoryDetail({
  category,
  posts,
}: CategoryDetailProps) {
  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary">
              Chuyên mục
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {category.name}
            </h1>

            {category.description && (
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>

          {category.image?.url && (
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl md:w-48">
              <Image
                src={category.image.url}
                alt={category.name}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {category.content && (
            <section>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                Giới thiệu
              </h2>

              <div
                className="prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{
                  __html: category.content,
                }}
              />
            </section>
          )}

          <section className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Bài viết trong chuyên mục
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Các bài viết mới nhất thuộc chuyên mục{" "}
                {category.name}.
              </p>
            </div>

            {posts.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                  <CategoryPostCard
                    key={post.id}
                    post={post}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  Chưa có bài viết nào trong chuyên mục này.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-20">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">
              Chuyên mục khác
            </h2>

            <CategorySidebar />
          </div>
        </aside>
      </div>
    </>
  );
}