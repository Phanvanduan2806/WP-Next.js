
import { NextRequest, NextResponse } from "next/server";
import { proxyOrderRequest } from "../../_lib";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      {
        success: false,
        message: "ID đơn hàng không hợp lệ.",
      },
      { status: 400 }
    );
  }

  return proxyOrderRequest({
    method: "POST",
    path: `/orders/${encodeURIComponent(id)}/cancel`,
  });
}
