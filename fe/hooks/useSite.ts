"use client";

import useSWR from "swr";

import {
  getSiteLogo,
  type SiteLogo,
} from "@/services/site.service";

export function useSite() {
  const { data, error, isLoading } = useSWR<SiteLogo>(
    "site-logo",
    async () => {
      const response = await getSiteLogo();

      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  return {
    logo: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}