"use client";

import PostCard from "./PostCard";

import { usePosts } from "@/hooks/usePosts";

export default function PostList() {
  const {
    posts,
    pagination,
    loading,
    error,
  } = usePosts(1, 10);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-xl bg-muted"
            />
          ),
        )}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">
        Chưa có bài viết.
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}
      </div>

      {pagination && (
        <div className="mt-8 text-sm text-muted-foreground">
          Trang {pagination.page} /{" "}
          {pagination.total_pages}
        </div>
      )}
    </div>
  );
}