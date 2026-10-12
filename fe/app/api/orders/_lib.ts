
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  WORDPRESS_API_URL,
  AUTH_COOKIE_NAME,
} from "@/lib/api";

type OrderMethod = "GET" | "POST" | "DELETE";

interface ProxyOptions {
  method: OrderMethod;
  path: string;
  body?: unknown;
  search?: string;
}

export async function proxyOrderRequest({
  method,
  path,
  body,
  search = "",
}: ProxyOptions): Promise<NextResponse> {
  try {
    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình WordPress API URL.",
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          code: "not_authenticated",
          message: "Vui lòng đăng nhập để quản lý đơn hàng.",
        },
        { status: 401 }
      );
    }

    const baseUrl = WORDPRESS_API_URL.replace(/\/+$/, "");
    const normalizedPath = path.replace(/^\/+/, "");
    const query = search
      ? search.startsWith("?")
        ? search
        : `?${search}`
      : "";

    const response = await fetch(
      `${baseUrl}/${normalizedPath}${query}`,
      {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        },
        ...(body !== undefined
          ? { body: JSON.stringify(body) }
          : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    const data = await response.json().catch(() => ({
      success: false,
      message: "WordPress trả về dữ liệu không hợp lệ.",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[Orders API]", error);

    const isTimeout =
      error instanceof Error && error.name === "TimeoutError";

    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? "Máy chủ xử lý đơn hàng quá thời gian chờ."
          : "Không thể kết nối đến dịch vụ đơn hàng.",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
