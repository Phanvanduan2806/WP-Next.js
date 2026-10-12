import { NextRequest, NextResponse } from "next/server";
import { wpNextjsApi } from "@/lib/wp-nextjs-api";

export async function POST(request: NextRequest) {
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
      { success: false, message: "Dữ liệu sản phẩm không hợp lệ." },
      { status: 400 },
    );
  }

  const item = body as Record<string, unknown>;

  if (
    typeof item.product_id !== "number" ||
    !Number.isSafeInteger(item.product_id) ||
    item.product_id <= 0
  ) {
    return NextResponse.json(
      { success: false, message: "product_id không hợp lệ." },
      { status: 400 },
    );
  }

  if (
    item.quantity !== undefined &&
    (typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0)
  ) {
    return NextResponse.json(
      { success: false, message: "quantity phải là số nguyên dương." },
      { status: 400 },
    );
  }

  if (
    item.variation_id !== undefined &&
    (typeof item.variation_id !== "number" ||
      !Number.isSafeInteger(item.variation_id) ||
      item.variation_id < 0)
  ) {
    return NextResponse.json(
      { success: false, message: "variation_id không hợp lệ." },
      { status: 400 },
    );
  }

  if (
    item.variation !== undefined &&
    (typeof item.variation !== "object" ||
      item.variation === null ||
      Array.isArray(item.variation))
  ) {
    return NextResponse.json(
      { success: false, message: "variation phải là một object." },
      { status: 400 },
    );
  }

  return wpNextjsApi(request, "/cart/items", {
    auth: "required",
    method: "POST",
    forwardQuery: false,
    body: {
      product_id: item.product_id,
      quantity: item.quantity ?? 1,
      variation_id: item.variation_id ?? 0,
      variation: item.variation ?? {},
    },
  });
}