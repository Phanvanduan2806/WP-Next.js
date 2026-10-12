"use client";

import { useState } from "react";

import PostCard from "./PostCard";

import { usePosts } from "@/hooks/usePosts";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PostList() {
  const [page, setPage] = useState(1);

  const {
    posts,
    pagination,
    loading,
    error,
  } = usePosts(page, 8);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Tất cả bài viết
        </h1>

        <p className="mt-2 text-muted-foreground">
          Khám phá những bài viết mới nhất và những nội dung hữu ích từ chúng tôi.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          Chưa có bài viết.
        </p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))}
          </div>

          {pagination &&
            pagination.total_pages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();

                        if (page > 1) {
                          setPage((current) => current - 1);
                        }
                      }}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    {
                      length: pagination.total_pages,
                    },
                    (_, index) => {
                      const pageNumber = index + 1;

                      return (
                        <PaginationItem
                          key={pageNumber}
                        >
                          <PaginationLink
                            href="#"
                            isActive={
                              pageNumber === page
                            }
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(pageNumber);
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    },
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();

                        if (
                          pagination &&
                          page <
                            pagination.total_pages
                        ) {
                          setPage(
                            (current) => current + 1,
                          );
                        }
                      }}
                      className={
                        page >=
                        pagination.total_pages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
        </>
      )}
    </div>
  );
}