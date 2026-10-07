"use client";

import useSWR from "swr";

import {
  getPage,
  type PageItem,
} from "@/services/page.service";

const fetcher = async (slug: string): Promise<PageItem> => {
  const response = await getPage(slug);

  return response.data;
};

export function usePage(slug: string) {
  const { data, error, isLoading } = useSWR(
    slug ? `page:${slug}` : null,
    () => fetcher(slug),
  );

  return {
    page: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}