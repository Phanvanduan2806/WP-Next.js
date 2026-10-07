"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    menuPath !== "#" &&
    (menuPath === "/"
      ? currentPath === "/"
      : currentPath === menuPath ||
        currentPath.startsWith(`${menuPath}/`));

  const hasChildren = Boolean(item.children?.length);

  const Icon = getLucideIcon(item.icon);

  /*
   * =========================
   * MOBILE
   * =========================
   */

  if (mobile) {
    return (
      <li>
        <Link
          href={item.url}
          onClick={onNavigate}
          className={[
            "group flex h-11 items-center gap-3 rounded-lg px-3",
            "text-sm transition-colors duration-200",
            isActive
              ? "bg-primary font-semibold text-white"
              : "font-medium text-foreground hover:bg-accent hover:text-primary",
          ].join(" ")}
        >
          {Icon && (
            <Icon
              className={[
                "size-[17px] shrink-0 transition-colors",
                isActive
                  ? "text-white"
                  : "text-muted-foreground group-hover:text-primary",
              ].join(" ")}
            />
          )}

          <span className="truncate">{item.title}</span>

          {hasChildren && (
            <LucideIcons.ChevronDown
              className={[
                "ml-auto size-4",
                isActive ? "text-white" : "text-muted-foreground",
              ].join(" ")}
            />
          )}
        </Link>

        {hasChildren && (
          <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
            {item.children?.map((child) => (
              <MenuItem
                key={child.id}
                item={child}
                mobile
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  /*
   * =========================
   * DESKTOP - DROPDOWN
   * =========================
   */

  if (hasChildren) {
    return (
      <li className="group relative">
        <Link
          href={item.url}
          className={[
            "relative flex h-10 items-center gap-2 rounded-lg px-3",
            "text-sm transition-colors duration-200",
            isActive
              ? "bg-primary font-semibold text-white"
              : "font-medium text-foreground hover:bg-accent hover:text-primary",
          ].join(" ")}
        >
          {Icon && (
            <Icon
              className={[
                "size-4 shrink-0 transition-colors",
                isActive
                  ? "text-white"
                  : "text-muted-foreground group-hover:text-primary",
              ].join(" ")}
            />
          )}

          <span>{item.title}</span>

          <LucideIcons.ChevronDown
            className={[
              "ml-0.5 size-3.5 transition-transform duration-200 group-hover:rotate-180",
              isActive ? "text-white" : "text-muted-foreground",
            ].join(" ")}
          />
        </Link>

        <ul
          className="
            invisible
            absolute
            left-0
            top-full
            z-50
            mt-2
            min-w-52
            translate-y-1
            rounded-xl
            border
            bg-background
            p-1.5
            opacity-0
            shadow-lg
            ring-1
            ring-black/5
            transition-all
            duration-200
            group-hover:visible
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          {item.children?.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </li>
    );
  }

  /*
   * =========================
   * DESKTOP - NORMAL ITEM
   * =========================
   */

  return (
    <li>
      <Link
        href={item.url}
        className={[
          "group flex h-10 items-center gap-2 rounded-lg px-3",
          "text-sm transition-colors duration-200",
          isActive
            ? "bg-primary font-semibold text-white"
            : "font-medium text-foreground hover:bg-accent hover:text-primary",
        ].join(" ")}
      >
        {Icon && (
          <Icon
            className={[
              "size-4 shrink-0 transition-colors",
              isActive
                ? "text-white"
                : "text-muted-foreground group-hover:text-primary",
            ].join(" ")}
          />
        )}

        <span>{item.title}</span>
      </Link>
    </li>
  );
}

/*
 * =========================
 * LUCIDE ICON
 * =========================
 */

function getLucideIcon(icon: string | null): LucideIcon | null {
  if (!icon) {
    return null;
  }

  const Icon =
    LucideIcons[icon as keyof typeof LucideIcons];

  if (
    typeof Icon === "function" ||
    (typeof Icon === "object" && Icon !== null)
  ) {
    return Icon as LucideIcon;
  }

  return null;
}

/*
 * =========================
 * PATH
 * =========================
 */

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
}