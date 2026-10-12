import { NextRequest, NextResponse } from "next/server";
import { proxyOrderRequest } from "../../_lib";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface PayOrderResponse {
  success?: boolean;
  payment_url?: string;
  return_url?: string;
  message?: string;
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

  const response = await proxyOrderRequest({
    method: "POST",
    path: `/orders/${encodeURIComponent(id)}/pay`,
  });

  const data: PayOrderResponse = await response.json().catch(() => ({
    success: false,
    message: "WordPress trả về dữ liệu không hợp lệ.",
  }));

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  if (
    data.success !== true ||
    typeof data.payment_url !== "string" ||
    !data.payment_url.trim()
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          data.message ||
          "WordPress không trả về đường dẫn thanh toán hợp lệ.",
      },
      { status: 502 }
    );
  }

  let paymentUrl: URL;

  try {
    paymentUrl = new URL(data.payment_url);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Đường dẫn thanh toán không hợp lệ.",
      },
      { status: 502 }
    );
  }

  if (
    paymentUrl.protocol !== "https:" ||
    paymentUrl.hostname !== "pay.payos.vn"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Địa chỉ thanh toán PayOS không hợp lệ.",
      },
      { status: 502 }
    );
  }

  let returnUrl: URL;

  try {
    if (
      typeof data.return_url !== "string" ||
      !data.return_url.trim()
    ) {
      throw new Error("Missing return URL");
    }

    returnUrl = new URL(data.return_url);

    if (
      returnUrl.protocol !== "http:" &&
      returnUrl.protocol !== "https:"
    ) {
      throw new Error("Invalid return URL protocol");
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "WordPress không trả về URL quay lại sau thanh toán hợp lệ.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    payment_url: paymentUrl.toString(),
    return_url: returnUrl.toString(),
  });
}