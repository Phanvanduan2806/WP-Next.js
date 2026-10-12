"use client";

import useSWR from "swr";

import { getPage, getPages } from "@/services/client/page.service";
import type { PageItem } from "@/services/types/page";

interface UsePagesData {
  pages: PageItem[];
}

export function usePages() {
  const { data, error, isLoading } =
    useSWR<UsePagesData>(
      "pages",
      async () => {
        const response = await getPages();

        return {
          pages: response.data,
        };
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      },
    );

  return {
    pages: data?.pages ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

export function usePage(slug: string) {
  const { data, error, isLoading } =
    useSWR(
      slug ? `page:${slug}` : null,
      () => getPage(slug),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      },
    );

  return {
    page: data?.data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}