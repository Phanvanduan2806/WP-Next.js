"use client";

import useSWR from "swr";

import {
  getCategories,
  type Category,
} from "@/services/category.service";

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    "categories",
    async () => {
      const response = await getCategories();

      if (!response.success) {
        throw new Error("Không thể lấy categories");
      }

      return response.data;
    },
  );

  return {
    categories: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}