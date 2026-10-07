import Breadcrumb from "@/components/layout/Breadcrumb";
import Categories from "@/components/category/Category";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16">

        {/* Breadcrumb */}
        <Breadcrumb />

        <header className="mb-10">
          <p className="text-sm font-medium text-primary">
            Chuyên mục
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Tất cả chuyên mục
          </h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Khám phá các bài viết theo từng chuyên mục.
          </p>
        </header>

        <Categories />
    </div>
  );
}