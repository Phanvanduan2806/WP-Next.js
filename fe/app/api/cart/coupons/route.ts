import { NextRequest, NextResponse } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: "invalid_request_body",
        message: "Dữ liệu gửi lên không hợp lệ.",
      },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("code" in body) ||
    typeof body.code !== "string" ||
    !body.code.trim()
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "invalid_coupon_code",
        message: "Vui lòng nhập mã giảm giá.",
      },
      { status: 400 },
    );
  }

  return wpNextjsApi(request, "/cart/coupons", {
    auth: "required",
    method: "POST",
    forwardQuery: false,
    body: { code: body.code.trim() },
  });
}

export async function DELETE(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        code: "invalid_coupon_code",
        message: "Vui lòng cung cấp mã giảm giá cần gỡ.",
      },
      { status: 400 },
    );
  }

  return wpNextjsApi(
    request,
    `/cart/coupons/${encodeURIComponent(code)}`,
    {
      auth: "required",
      method: "DELETE",
      forwardQuery: false,
    },
  );
}