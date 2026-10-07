"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MenuItem as MenuItemType } from "@/services/menu.service";

interface MenuItemProps {
  item: MenuItemType;
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function MenuItem({
  item,
  mobile = false,
  onNavigate,
}: MenuItemProps) {
  const pathname = usePathname();

  const currentPath = normalizePath(pathname);
  const menuPath = normalizePath(item.url);

  const isActive =
    menuPath === "/"
      ? currentPath === "/"
      : currentPath === menuPath ||
        currentPath.startsWith(`${menuPath}/`);

  if (mobile) {
    return (
      <li>
        <Link
          href={item.url}
          onClick={onNavigate}
          className={
            isActive
              ? "flex h-11 items-center rounded-md bg-accent px-3 text-sm font-semibold text-primary"
              : "flex h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          }
        >
          {item.title}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.url}
        className={
          isActive
            ? "relative flex h-10 items-center px-4 text-sm font-semibold text-primary after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
            : "relative flex h-10 items-center px-4 text-sm font-medium text-foreground transition-colors hover:text-primary"
        }
      >
        {item.title}
      </Link>
    </li>
  );
}

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
}