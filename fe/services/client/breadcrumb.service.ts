import { getCategory } from "@/services/client/category.service";
import { getPages } from "@/services/client/page.service";
import { getPost } from "@/services/client/post.service";
import { productService } from "@/services/client/product.service";

export interface BreadcrumbItemData {
  href: string;
  label: string;
  isLast: boolean;
  isDynamic: boolean;
}

function formatSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getBreadcrumbItems(
  pathname: string,
): Promise<BreadcrumbItemData[]> {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [
      {
        href: "/",
        label: "Trang chủ",
        isLast: true,
        isDynamic: false,
      },
    ];
  }

  const isCategory = segments[0] === "category";
  const isPosts = segments[0] === "posts";
  const isProducts = segments[0] === "products";

  let categoryTitle: string | undefined;
  let productTitle: string | undefined;
  let rootTitle: string | undefined;

  // Chuyên mục
  if (isCategory && segments[1]) {
    try {
      const response = await getCategory(segments[1]);
      categoryTitle = response?.data?.name;
    } catch {
      // Giữ tên hiển thị theo slug.
    }
  }

  // Sản phẩm
  if (isProducts && segments.length === 2) {
    try {
      const response = await productService.getProductBySlug(
        segments[1],
      );
      productTitle = response?.item?.name;
    } catch {
      // Giữ tên hiển thị theo slug.
    }
  }

  // URL dạng /<slug>: xác định Page trước, sau đó mới tìm Post.
  const isRootDetail =
    segments.length === 1 &&
    !isCategory &&
    !isPosts &&
    !isProducts;

  if (isRootDetail) {
    const slug = segments[0];

    try {
      const pagesResponse = await getPages();

      const matchedPage = pagesResponse?.success
        ? pagesResponse.data.find((page) => page.slug === slug)
        : undefined;

      if (matchedPage) {
        rootTitle = matchedPage.title;
      }
    } catch {
      // Nếu không lấy được danh sách trang, thử tìm bài viết.
    }

    if (!rootTitle) {
      try {
        const post = await getPost(slug);

        if (post?.success && post.data?.title) {
          rootTitle = post.data.title;
        }
      } catch {
        // Giữ tên hiển thị theo slug.
      }
    }
  }

  const items: BreadcrumbItemData[] = [
    {
      href: "/",
      label: "Trang chủ",
      isLast: false,
      isDynamic: false,
    },
  ];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    let label = formatSlug(segment);
    let isDynamic = false;

    if (index === 0 && isCategory) {
      label = "Chuyên mục";
    } else if (index === 0 && isPosts) {
      label = "Bài viết";
    } else if (index === 0 && isProducts) {
      label = "Sản phẩm";
    } else if (isCategory && index === 1 && categoryTitle) {
      label = categoryTitle;
      isDynamic = true;
    } else if (isProducts && index === 1 && productTitle) {
      label = productTitle;
      isDynamic = true;
    } else if (isRootDetail && rootTitle) {
      label = rootTitle;
      isDynamic = true;
    }

    items.push({
      href: "/" + segments.slice(0, index + 1).join("/"),
      label,
      isLast,
      isDynamic,
    });
  });

  return items;
}