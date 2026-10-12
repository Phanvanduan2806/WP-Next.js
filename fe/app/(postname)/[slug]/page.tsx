import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageDefault from "@/components/pages/PageDefault";
import PostDefault from "@/components/posts/PostDefault";

import { getPage } from "@/services/server/page.service";
import { getPost } from "@/services/server/post.service";
import { generateSeoMetadata } from "@/services/server/seo.service";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return generateSeoMetadata(
    `/${slug}/`,
  );
}

export default async function ContentPage({
  params,
}: PageProps) {
  const { slug } = await params;

  try {
    const postResponse = await getPost(slug);

    if (
      postResponse.success &&
      postResponse.data
    ) {
      return (
        <PostDefault
          post={postResponse.data}
        />
      );
    }
  } catch {}

  try {
    const pageResponse = await getPage(slug);

    if (
      pageResponse.success &&
      pageResponse.data
    ) {
      return (
        <PageDefault
          page={pageResponse.data}
        />
      );
    }
  } catch {}

  notFound();
}