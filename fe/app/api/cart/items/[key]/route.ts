import { NextRequest, NextResponse } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

type RouteContext = {
  params: Promise<{ key: string }>;
};

async function getCartItemEndpoint(context: RouteContext) {
  const { key } = await context.params;

  if (!/^[a-fA-F0-9]{32}$/.test(key)) {
    return null;
  }

  return `/cart/items/${key}`;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Dữ liệu JSON không hợp lệ." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { success: false, message: "Dữ liệu cập nhật không hợp lệ." },
      { status: 400 },
    );
  }

  const quantity = (body as Record<string, unknown>).quantity;

  if (
    typeof quantity !== "number" ||
    !Number.isSafeInteger(quantity) ||
    quantity < 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "quantity phải là số nguyên lớn hơn hoặc bằng 0.",
      },
      { status: 400 },
    );
  }

  const endpoint = await getCartItemEndpoint(context);

  if (!endpoint) {
    return NextResponse.json(
      { success: false, message: "Cart item key không hợp lệ." },
      { status: 400 },
    );
  }

  return wpNextjsApi(request, endpoint, {
    auth: "required",
    method: "PATCH",
    forwardQuery: false,
    body: { quantity },
  });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const endpoint = await getCartItemEndpoint(context);

  if (!endpoint) {
    return NextResponse.json(
      { success: false, message: "Cart item key không hợp lệ." },
      { status: 400 },
    );
  }

  return wpNextjsApi(request, endpoint, {
    auth: "required",
    method: "DELETE",
    forwardQuery: false,
  });
}