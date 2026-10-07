"use client";

import { useEffect, useState } from "react";

import {
  getMenu,
  type MenuItem,
} from "@/services/menu.service";

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMenu()
      .then((response) => {
        const normalizedMenu = response.data.map((item) => ({
          ...item,
          url: getNextUrl(item.url),
        }));

        setMenu(normalizedMenu);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    menu,
    loading,
    error,
  };
}

function getNextUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.pathname === "/"
      ? "/"
      : parsedUrl.pathname + parsedUrl.search;
  } catch {
    return "/";
  }
}