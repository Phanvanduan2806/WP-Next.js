
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login, isLoading, error } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await login({
        username: username.trim(),
        password,
      });

      // Cập nhật trạng thái đăng nhập trên header.
      window.dispatchEvent(new Event("auth:changed"));

      // Yêu cầu giỏ hàng tải lại sau khi đăng nhập.
      window.dispatchEvent(new Event("cart:updated"));

      const requestedRedirect = searchParams.get("redirect");

      const redirectTo =
        requestedRedirect?.startsWith("/") &&
        !requestedRedirect.startsWith("//")
          ? requestedRedirect
          : "/";

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Tài khoản hoặc mật khẩu không chính xác.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitting = isSubmitting || isLoading;

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Đăng nhập
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Đăng nhập để tiếp tục sử dụng tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Tài khoản hoặc email
            </label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={submitting}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhập tài khoản hoặc email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={submitting}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={submitting}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute inset-y-0 right-3 text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {(formError || error) && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <LoaderCircle className="size-4 animate-spin" />
            )}

            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link
            href="/products"
            className="font-medium text-gray-900 hover:underline"
          >
            Tiếp tục xem sản phẩm
          </Link>
        </div>
      </section>
    </main>
  );
}
