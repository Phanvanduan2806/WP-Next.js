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

        setMenu(buildMenuTree(normalizedMenu));
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Không thể lấy menu"
        );
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
  if (!url || url === "#") {
    return "#";
  }

  try {
    const parsedUrl = new URL(url);

    return parsedUrl.pathname === "/"
      ? "/"
      : parsedUrl.pathname + parsedUrl.search;
  } catch {
    return url.startsWith("/") ? url : "/";
  }
}

function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>();

  items.forEach((item) => {
    map.set(item.id, {
      ...item,
      children: [],
    });
  });

  const tree: MenuItem[] = [];

  items.forEach((item) => {
    const current = map.get(item.id);

    if (!current) {
      return;
    }

    if (item.parent === 0) {
      tree.push(current);
      return;
    }

    const parent = map.get(item.parent);

    if (parent) {
      parent.children?.push(current);
    }
  });

  return tree;
}