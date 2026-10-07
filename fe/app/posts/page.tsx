import PostList from "@/components/posts/PostList";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function PostsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb />
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Bài viết
      </h1>

      <p className="mt-2 text-muted-foreground">Những bài viết mới nhất.</p>

      <PostList />
    </div>
  );
}
