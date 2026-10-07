"use client";

import { useMenu } from "@/hooks/useMenu";

import MenuItem from "./MenuItem";

interface MenuProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function Menu({
  mobile = false,
  onNavigate,
}: MenuProps) {
  const { menu, loading, error } = useMenu();

  if (loading) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <nav aria-label="Main navigation">
      <ul
        className={
          mobile
            ? "flex flex-col gap-1"
            : "flex items-center gap-1"
        }
      >
        {menu.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            mobile={mobile}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}