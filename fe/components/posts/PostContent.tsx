import type { PostItem } from "@/services/post.service";
import LatestPostsSection from "./LatestPostsSection";
interface PostContentProps {
  post: PostItem;
}

export default function PostContent({
  post,
}: PostContentProps) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Content - 8/12 */}
      <article className="min-w-0 lg:col-span-8">
        <div className="prose prose-neutral max-w-none">
          <header>
            <div className="mb-3 flex flex-wrap gap-2 not-prose">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-sm font-medium text-primary"
                >
                  {category.name}
                </span>
              ))}
            </div>

            <h1>{post.title}</h1>

            <div className="not-prose mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>{post.author.name}</span>

              <span>
                {new Date(post.date).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </header>

          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="not-prose h-auto w-full rounded-xl"
            />
          )}

          <div
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />
        </div>
      </article>

      {/* Sidebar - 4/12 */}
      <aside className="lg:col-span-4">
        <LatestPostsSection />
      </aside>
    </div>
  );
}