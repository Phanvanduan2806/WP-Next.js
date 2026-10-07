import { NextResponse } from "next/server";

import { WORDPRESS_API_URL } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.toString();

    const response = await fetch(
      `${WORDPRESS_API_URL}/posts${query ? `?${query}` : ""}`,
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
    console.error("POSTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server lỗi",
      },
      {
        status: 500,
      },
    );
  }
}
