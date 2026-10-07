"use client";

import Link from "next/link";

import { usePosts } from "@/hooks/usePosts";

export default function LatestPostsSection() {
  const {
    posts,
    loading,
    error,
  } = usePosts(1, 5);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Bài viết mới nhất
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Những bài viết mới được cập nhật.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border p-4"
            >
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Không thể tải bài viết.
          </p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group border-b pb-4 last:border-b-0"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="block"
              >
                <h3 className="font-medium leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </h3>

                <div className="mt-2 text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("vi-VN")}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && !posts.length && (
        <p className="text-sm text-muted-foreground">
          Chưa có bài viết nào.
        </p>
      )}
    </section>
  );
}