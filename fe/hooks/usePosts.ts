"use client";

import useSWR from "swr";

import {
  getPost,
  getPosts,
  type PostItem,
  type PostPagination,
} from "@/services/post.service";

export function usePosts(
  page = 1,
  perPage = 10,
  slug?: string,
) {
  const isSinglePost = Boolean(slug);

  const { data, error, isLoading } = useSWR<{
    posts: PostItem[];
    post: PostItem | null;
    pagination: PostPagination | null;
  }>(
    isSinglePost
      ? `post:${slug}`
      : `posts:${page}:${perPage}`,
    async () => {
      if (slug) {
        const response = await getPost(slug);

        return {
          posts: [],
          post: response.data,
          pagination: null,
        };
      }

      const response = await getPosts(
        page,
        perPage,
      );

      return {
        posts: response.data,
        post: null,
        pagination: response.pagination,
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  return {
    posts: data?.posts ?? [],
    post: data?.post ?? null,
    pagination: data?.pagination ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}