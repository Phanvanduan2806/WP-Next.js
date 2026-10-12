"use client";

import useSWR from "swr";

import { getCategories } from "@/services/client/category.service";
import type { CategoryItem } from "@/services/types/category";

interface UseCategoriesData {
  categories: CategoryItem[];
}

export function useCategories() {
  const { data, error, isLoading } =
    useSWR<UseCategoriesData>(
      "categories",
      async () => {
        const response = await getCategories();

        return {
          categories: response.data,
        };
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      },
    );

  return {
    categories: data?.categories ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}