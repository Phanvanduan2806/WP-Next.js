import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import Container from "@/components/layout/Container";
import CategoryDetail from "@/components/category/CategoryDetail";

import { getCategory } from "@/services/server/category.service";
import { getPosts } from "@/services/server/post.service";
import { generateSeoMetadata } from "@/services/server/seo.service";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  return generateSeoMetadata(
    `/category/${slug}/`,
  );
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const categoryResponse =
    await getCategory(slug);

  if (
    !categoryResponse.success ||
    !categoryResponse.data
  ) {
    notFound();
  }

  const postsResponse =
    await getPosts(1, 10, slug);

  return (
    <Container>
      <Breadcrumb />

      <CategoryDetail
        category={categoryResponse.data}
        posts={postsResponse.data ?? []}
      />
    </Container>
  );
}