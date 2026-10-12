
"use client";

import Link from "next/link";
import { ArrowLeft, Mail, UserRound } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, isLoading: loading } = useAuth();

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-xl border p-8 text-center">
          <UserRound className="mx-auto size-10 text-muted-foreground" />

          <h1 className="mt-4 text-xl font-semibold">
            Thông tin cá nhân
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng đăng nhập để xem thông tin tài khoản.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 md:px-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại tài khoản
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Thông tin cá nhân
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Thông tin tài khoản hiện tại của bạn.
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border">
        <div className="flex items-center gap-4 border-b p-6">
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

            <p className="text-sm text-muted-foreground">
              Thông tin tài khoản
            </p>
          </div>
        </div>

        <div className="divide-y">
          <div className="grid gap-2 p-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <span className="text-sm text-muted-foreground">
              ID tài khoản
            </span>

            <span className="break-words text-sm font-medium">
              {user.id}
            </span>
          </div>

          <div className="grid gap-2 p-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <span className="text-sm text-muted-foreground">
              Tên hiển thị
            </span>

            <span className="break-words text-sm font-medium">
              {user.name || "Chưa cập nhật"}
            </span>
          </div>

          <div className="grid gap-2 p-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <span className="text-sm text-muted-foreground">
              Tên đăng nhập
            </span>

            <span className="break-words text-sm font-medium">
              {user.username || "Chưa có thông tin"}
            </span>
          </div>

          <div className="grid gap-2 p-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              Email
            </span>

            <span className="break-all text-sm font-medium">
              {user.email || "Chưa cập nhật"}
            </span>
          </div>
        </div>
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        Muốn thay đổi thông tin? Cần có API cập nhật tương ứng từ WordPress.
      </p>
    </main>
  );
}