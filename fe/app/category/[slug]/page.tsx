import Image from "next/image";
import { notFound } from "next/navigation";

import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import CategorySidebar from "@/components/category/CategorySidebar";
import { getCategoryServer } from "@/services/category.service";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const response = await getCategoryServer(slug);

  if (!response.success || !response.data) {
    notFound();
  }

  const category = response.data;

  return (
    <Container>
      <Breadcrumb />

      {/* Category Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary">
              Chuyên mục
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {category.name}
            </h1>

            {category.description && (
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>

          {category.image.url && (
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl md:h-32 md:w-48">
              <Image
                src={category.image.url}
                alt={category.name}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* 8/4 */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Content - 8 */}
        <section className="min-w-0 lg:col-span-8">
          {category.content && (
            <div
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{
                __html: category.content,
              }}
            />
          )}
        </section>

        {/* Sidebar - 4 */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">
              Chuyên mục khác
            </h2>

            <CategorySidebar />
          </div>
        </aside>
      </div>
    </Container>
  );
}