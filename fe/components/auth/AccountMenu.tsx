"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Package, Settings, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export default function AccountMenu() {
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleAuthChanged = () => {
      void refreshUser();
    };

    window.addEventListener("auth:changed", handleAuthChanged);

    return () => {
      window.removeEventListener("auth:changed", handleAuthChanged);
    };
  }, [refreshUser]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // useAuth vẫn xóa state đăng nhập trong finally.
    } finally {
      // Reset giỏ hàng và đồng bộ trạng thái tài khoản.
      window.dispatchEvent(new Event("auth:logged-out"));
      window.dispatchEvent(new Event("auth:changed"));

      setIsLoggingOut(false);

      router.replace("/");
      router.refresh();
    }
  }

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="size-10 animate-pulse rounded-md bg-muted"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Đăng nhập"
        title="Đăng nhập"
        className="inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <LogIn className="size-5" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Tài khoản"
        title="Tài khoản"
        className="inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <UserRound className="size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">
            {user.name || user.username || "Tài khoản của tôi"}
          </p>

          {user.email && (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/account" />}>
          <UserRound className="mr-2 size-4" />
          Tài khoản của tôi
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link href="/account/orders" />}>
          <Package className="mr-2 size-4" />
          Đơn hàng
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link href="/account/profile" />}>
          <Settings className="mr-2 size-4" />
          Thông tin cá nhân
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
