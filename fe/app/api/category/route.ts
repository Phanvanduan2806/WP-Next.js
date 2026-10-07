import { NextResponse } from "next/server";

import { WORDPRESS_API_URL } from "@/lib/api";

export async function GET() {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/category`,
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
    console.error("CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server lỗi",
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}