"use client";

import useSWR from "swr";

import { getPosts } from "@/services/client/post.service";
import type {
  PostItem,
  PostPagination,
} from "@/services/types/post";

interface UsePostsData {
  posts: PostItem[];
  pagination: PostPagination | null;
}

export function usePosts(
  page = 1,
  perPage = 10,
  category?: string,
) {
  const { data, error, isLoading } =
    useSWR<UsePostsData>(
      `posts:${page}:${perPage}:${category ?? ""}`,
      async () => {
        const response = await getPosts(
          page,
          perPage,
          category,
        );

        return {
          posts: response.data,
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
    pagination: data?.pagination ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}