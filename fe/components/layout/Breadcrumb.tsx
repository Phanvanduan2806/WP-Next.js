"use client";

import { usePathname } from "next/navigation";
import useSWR from "swr";

import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getCategory } from "@/services/category.service";
import { getPage } from "@/services/page.service";
import { getPost } from "@/services/post.service";

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const isCategory = segments[0] === "category";
  const isPosts = segments[0] === "posts";

  const isPage =
    segments.length === 1 &&
    !isCategory &&
    !isPosts;

  const categorySlug =
    isCategory && segments[1]
      ? segments[1]
      : null;

  const postSlug =
    isPosts && segments[1]
      ? segments[1]
      : null;

  const pageSlug =
    isPage && segments[0]
      ? segments[0]
      : null;

  const { data: categoryResponse, isLoading: categoryLoading } =
    useSWR(
      categorySlug
        ? `breadcrumb-category-${categorySlug}`
        : null,
      () => getCategory(categorySlug!),
    );

  const { data: pageResponse, isLoading: pageLoading } =
    useSWR(
      pageSlug
        ? `breadcrumb-page-${pageSlug}`
        : null,
      () => getPage(pageSlug!),
    );

  const { data: postResponse, isLoading: postLoading } =
    useSWR(
      postSlug
        ? `breadcrumb-post-${postSlug}`
        : null,
      () => getPost(postSlug!),
    );

  const isTitleLoading =
    (isCategory && categoryLoading) ||
    (isPosts && postLoading) ||
    (isPage && pageLoading);

  const getLabel = (
    segment: string,
    index: number,
  ) => {
    // Category
    if (
      index === 0 &&
      segment === "category"
    ) {
      return "Chuyên mục";
    }

    // Posts
    if (
      index === 0 &&
      segment === "posts"
    ) {
      return "Bài viết";
    }

    // Category detail
    if (
      isCategory &&
      index === 1 &&
      categoryResponse?.data?.name
    ) {
      return categoryResponse.data.name;
    }

    // Post detail
    if (
      isPosts &&
      index === 1 &&
      postResponse?.data?.title
    ) {
      return postResponse.data.title;
    }

    // Page
    if (
      isPage &&
      index === 0 &&
      pageResponse?.data?.title
    ) {
      return pageResponse.data.title;
    }

    return decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      );
  };

  const isDynamicTitle = (
    index: number,
  ) => {
    if (isCategory && index === 1) {
      return true;
    }

    if (isPosts && index === 1) {
      return true;
    }

    if (isPage && index === 0) {
      return true;
    }

    return false;
  };

  return (
    <div className="mb-6">
      <BreadcrumbUI>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>
                Trang chủ
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink href="/">
                Trang chủ
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {segments.map((segment, index) => {
            const isLast =
              index === segments.length - 1;

            const href =
              "/" +
              segments
                .slice(0, index + 1)
                .join("/");

            const dynamicTitle =
              isDynamicTitle(index);

            const loading =
              dynamicTitle && isTitleLoading;

            const label = getLabel(
              segment,
              index,
            );

            return (
              <div
                key={href}
                className="contents"
              >
                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {loading ? (
                        <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted align-middle" />
                      ) : (
                        label
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {loading ? (
                        <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted align-middle" />
                      ) : (
                        label
                      )}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </BreadcrumbUI>
    </div>
  );
}