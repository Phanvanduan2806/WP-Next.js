
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Package,
  Settings,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

const accountLinks = [
  {
    title: "Đơn hàng",
    description: "Theo dõi và xem lịch sử đơn hàng của bạn.",
    href: "/account/orders",
    icon: Package,
  },
  {
    title: "Thông tin cá nhân",
    description: "Quản lý thông tin và hồ sơ cá nhân.",
    href: "/account/profile",
    icon: Settings,
  },
];

export default function AccountPage() {
  const { user, isLoading: loading } = useAuth();

  if (loading) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-32 animate-pulse rounded-xl bg-muted" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border p-8 text-center">
          <UserRound className="mx-auto size-10 text-muted-foreground" />

          <h1 className="mt-4 text-2xl font-semibold">
            Tài khoản của tôi
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng đăng nhập để quản lý tài khoản và xem đơn hàng.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Tài khoản của tôi
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý tài khoản và các hoạt động mua sắm của bạn.
        </p>
      </div>

      <section className="mt-8 rounded-xl border p-6">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || user.username || "Ảnh đại diện"}
              className="size-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-7" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">
              {user.name || user.username || "Tài khoản của tôi"}
            </h2>

            {user.email && (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Quản lý tài khoản</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {accountLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-accent/50"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{item.title}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}