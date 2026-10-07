"use client";

import { useParams } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import PostContent from "@/components/posts/PostContent";
import { usePosts } from "@/hooks/usePosts";

export default function PostPage() {
  const params = useParams<{ slug: string }>();

  const {
    post,
    loading,
    error,
  } = usePosts(1, 10, params.slug);

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-6 md:px-6">
        <Breadcrumb />

        <div className="h-10 w-3/4 animate-pulse rounded-md bg-muted" />

        <div className="mt-4 h-5 w-1/3 animate-pulse rounded-md bg-muted" />

        <div className="mt-8 aspect-video animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center md:px-6">
        <h1 className="text-2xl font-semibold">
          Không tìm thấy bài viết
        </h1>

        <p className="mt-2 text-muted-foreground">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-6 md:px-6">
      <Breadcrumb />

      <PostContent post={post} />
    </div>
  );
}