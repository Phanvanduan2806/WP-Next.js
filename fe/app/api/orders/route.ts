import { NextRequest } from "next/server";
import { proxyOrderRequest } from "./_lib";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return proxyOrderRequest({
    method: "GET",
    path: "/orders",
    search: request.nextUrl.search,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        message: "Dữ liệu tạo đơn hàng không hợp lệ.",
      },
      { status: 400 }
    );
  }

  return proxyOrderRequest({
    method: "POST",
    path: "/orders",
    body,
  });
}
