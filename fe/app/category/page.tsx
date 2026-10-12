import Breadcrumb from "@/components/layout/Breadcrumb";
import Container from "@/components/layout/Container";
import Categories from "@/components/category/Category";

export default function CategoriesPage() {
  return (
    <Container>
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
    </Container>
  );
}