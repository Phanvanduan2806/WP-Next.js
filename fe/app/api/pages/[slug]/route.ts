import { NextResponse } from "next/server";

import { WORDPRESS_API_URL } from "@/lib/api";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { slug } = await params;

    const response = await fetch(
      `${WORDPRESS_API_URL}/pages/${encodeURIComponent(slug)}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("PAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server lỗi",
        data: null,
      },
      {
        status: 500,
      },
    );
  }
}