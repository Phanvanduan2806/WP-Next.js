import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  WORDPRESS_API_URL,
  AUTH_COOKIE_NAME,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình WordPress API URL.",
        },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          code: "not_authenticated",
          message: "Vui lòng đăng nhập để tiếp tục checkout.",
        },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu checkout không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu checkout phải là một object JSON.",
        },
        { status: 400 },
      );
    }

    const baseUrl = WORDPRESS_API_URL.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/checkout/validate`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message: "Phản hồi từ WordPress không hợp lệ.",
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      cookieStore.delete(AUTH_COOKIE_NAME);
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Checkout Validate API] POST failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối đến dịch vụ checkout.",
      },
      { status: 502 },
    );
  }
}
