import { NextResponse } from "next/server";

import { WORDPRESS_API_URL } from "@/lib/api";

interface RouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;

    const response = await fetch(
      `${WORDPRESS_API_URL}/category/${encodeURIComponent(slug)}`,
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
    console.error("CATEGORY ERROR:", error);

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
