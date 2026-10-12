import { NextRequest, NextResponse } from "next/server";

import { getSeo } from "@/services/server/seo.service";

export async function GET(
  request: NextRequest,
) {
  try {
    const url =
      request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu tham số url",
        },
        {
          status: 400,
        },
      );
    }

    const seo = await getSeo(url);

    return NextResponse.json({
      success: true,
      data: seo,
    });
  } catch (error) {
    console.error(
      "SEO API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy SEO",
      },
      {
        status: 500,
      },
    );
  }
}