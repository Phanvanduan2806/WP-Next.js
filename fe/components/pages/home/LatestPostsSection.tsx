"use client";

import Link from "next/link";

import PostCard from "@/components/posts/PostCard";
import { usePosts } from "@/hooks/usePosts";

export default function LatestPostsSection() {
  const {
    posts,
    loading,
    error,
  } = usePosts(1, 3);

  return (
    <section>
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-20">

        <div className="mb-8 flex items-end justify-between gap-4">

          <div>
            <p className="text-sm font-medium text-primary">
              Blog
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Bài viết mới nhất
            </h2>
          </div>

          <Link
            href="/posts"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Xem tất cả →
          </Link>

        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              Chưa có bài viết.
            </p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}