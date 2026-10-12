
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  WORDPRESS_API_URL,
  AUTH_COOKIE_NAME,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const CHECKOUT_API_URL = `${WORDPRESS_API_URL.replace(/\/+$/, "")}/checkout`;

async function proxyCheckoutRequest(
  method: "GET" | "POST",
  body?: unknown,
): Promise<NextResponse> {
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

    const response = await fetch(CHECKOUT_API_URL, {
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
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      console.error(
        `[Checkout API] WordPress trả về dữ liệu không phải JSON (${method}).`,
      );

      return NextResponse.json(
        {
          success: false,
          message: "Phản hồi từ WordPress không hợp lệ.",
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        cookieStore.delete(AUTH_COOKIE_NAME);
      }

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`[Checkout API] ${method} failed:`, error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối đến dịch vụ checkout.",
      },
      { status: 502 },
    );
  }
}

/**
 * GET /api/checkout
 * Lấy thông tin khách hàng, địa chỉ, giỏ hàng và phương thức thanh toán.
 */
export async function GET() {
  return proxyCheckoutRequest("GET");
}

/**
 * POST /api/checkout
 * Tạo đơn hàng WooCommerce từ giỏ hàng hiện tại.
 */
export async function POST(request: NextRequest) {
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

  return proxyCheckoutRequest("POST", body);
}
