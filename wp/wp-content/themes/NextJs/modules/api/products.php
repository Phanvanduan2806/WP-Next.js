<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * =========================================================
 * PRODUCT API ROUTES
 * =========================================================
 */

add_action('rest_api_init', function () {

    /**
     * GET /wp-json/nextjs/v1/products
     */
    register_rest_route('nextjs/v1', '/products', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'nextjs_get_products',
        'permission_callback' => '__return_true',
        'args' => [
            'page' => [
                'default' => 1,
                'sanitize_callback' => 'absint',
            ],
            'per_page' => [
                'default' => 12,
                'sanitize_callback' => 'absint',
            ],
            'search' => [
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ]);

    /**
     * GET /wp-json/nextjs/v1/products/{slug}
     */
    register_rest_route('nextjs/v1', '/products/(?P<slug>[a-zA-Z0-9-]+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'nextjs_get_product_by_slug',
        'permission_callback' => '__return_true',
        'args' => [
            'slug' => [
                'required' => true,
                'sanitize_callback' => 'sanitize_title',
            ],
        ],
    ]);
});


/**
 * =========================================================
 * GET PRODUCT LIST
 * =========================================================
 *
 * GET /wp-json/nextjs/v1/products?page=1&per_page=12
 */
function nextjs_get_products(WP_REST_Request $request)
{
    if (!function_exists('wc_get_products')) {
        return nextjs_api_error(
            'woocommerce_unavailable',
            'WooCommerce chưa được kích hoạt.',
            503
        );
    }

    $page = max(
        1,
        absint($request->get_param('page'))
    );

    $per_page = min(
        50,
        max(1, absint($request->get_param('per_page')))
    );

    $search = sanitize_text_field(
        $request->get_param('search') ?? ''
    );

    $result = wc_get_products([
        'status' => 'publish',
        'limit' => $per_page,
        'page' => $page,
        'paginate' => true,
        's' => $search,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    $items = [];

    foreach ($result->products as $product) {
        $items[] = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'type' => $product->get_type(),

            'description' => wp_strip_all_tags(
                $product->get_short_description()
            ),

            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'currency' => get_woocommerce_currency(),

            'permalink' => get_permalink(
                $product->get_id()
            ),

            'image' => wp_get_attachment_image_url(
                $product->get_image_id(),
                'woocommerce_thumbnail'
            ) ?: null,

            'in_stock' => $product->is_in_stock(),
            'purchasable' => $product->is_purchasable(),
        ];
    }

    return rest_ensure_response([
        'success' => true,
        'items' => $items,
        'pagination' => [
            'page' => $page,
            'per_page' => $per_page,
            'total' => (int) $result->total,
            'total_pages' => (int) $result->max_num_pages,
        ],
    ]);
}


/**
 * =========================================================
 * GET PRODUCT DETAIL BY SLUG
 * =========================================================
 *
 * GET /wp-json/nextjs/v1/products/{slug}
 */
function nextjs_get_product_by_slug(WP_REST_Request $request)
{
    if (!function_exists('wc_get_product')) {
        return nextjs_api_error(
            'woocommerce_unavailable',
            'WooCommerce chưa được kích hoạt.',
            503
        );
    }

    $slug = sanitize_title(
        $request->get_param('slug')
    );

    if ($slug === '') {
        return nextjs_api_error(
            'invalid_product_slug',
            'Slug sản phẩm không hợp lệ.',
            400
        );
    }

    // Tìm sản phẩm theo slug.
    $post = get_page_by_path(
        $slug,
        OBJECT,
        'product'
    );

    if (!$post || $post->post_status !== 'publish') {
        return nextjs_api_error(
            'product_not_found',
            'Không tìm thấy sản phẩm.',
            404
        );
    }

    $product = wc_get_product($post->ID);

    if (!$product) {
        return nextjs_api_error(
            'product_not_found',
            'Không tìm thấy sản phẩm.',
            404
        );
    }

    /**
     * ---------------------------------------------------------
     * PRODUCT IMAGES
     * ---------------------------------------------------------
     */

    $images = [];

    $image_id = $product->get_image_id();

    if ($image_id) {
        $image_url = wp_get_attachment_image_url(
            $image_id,
            'full'
        );

        if ($image_url) {
            $images[] = $image_url;
        }
    }

    foreach ($product->get_gallery_image_ids() as $gallery_id) {
        $image_url = wp_get_attachment_image_url(
            $gallery_id,
            'full'
        );

        if ($image_url) {
            $images[] = $image_url;
        }
    }

    /**
     * ---------------------------------------------------------
     * PRODUCT ATTRIBUTES
     * ---------------------------------------------------------
     */

    $attributes = [];

    foreach ($product->get_attributes() as $attribute) {
        if ($attribute->is_taxonomy()) {
            $options = wc_get_product_terms(
                $product->get_id(),
                $attribute->get_name(),
                [
                    'fields' => 'names',
                ]
            );

            if (is_wp_error($options)) {
                $options = [];
            }

            $attribute_slug = wc_attribute_taxonomy_slug(
                $attribute->get_name()
            );

            $attribute_key = 'attribute_' .
                $attribute->get_name();
        } else {
            $options = $attribute->get_options();

            $attribute_slug = sanitize_title(
                $attribute->get_name()
            );

            $attribute_key = 'attribute_' .
                $attribute_slug;
        }

        $attributes[] = [
            'name' => wc_attribute_label(
                $attribute->get_name(),
                $product
            ),

            'slug' => $attribute_slug,
            'key' => $attribute_key,

            'options' => array_values($options),

            'variation' => $attribute->get_variation(),
            'visible' => $attribute->get_visible(),
        ];
    }

    /**
     * ---------------------------------------------------------
     * PRODUCT VARIATIONS
     * ---------------------------------------------------------
     */

    $variations = [];

    if ($product->is_type('variable')) {
        foreach ($product->get_children() as $variation_id) {
            $variation = wc_get_product($variation_id);

            if (
                !$variation ||
                !$variation->is_type('variation') ||
                $variation->get_parent_id() !== $product->get_id()
            ) {
                continue;
            }

            // Không đưa biến thể riêng tư hoặc bản nháp vào API.
            if ($variation->get_status() !== 'publish') {
                continue;
            }

            $variation_image = null;
            $variation_image_id = $variation->get_image_id();

            if ($variation_image_id) {
                $variation_image = wp_get_attachment_image_url(
                    $variation_image_id,
                    'full'
                ) ?: null;
            }

            $variation_attributes = [];

            foreach (
                $variation->get_variation_attributes()
                as $key => $value
            ) {
                $variation_attributes[$key] = $value;
            }

            $variations[] = [
                'id' => $variation->get_id(),

                'sku' => $variation->get_sku(),

                'attributes' => $variation_attributes,

                'price' => $variation->get_price(),
                'regular_price' => $variation->get_regular_price(),
                'sale_price' => $variation->get_sale_price(),

                'currency' => get_woocommerce_currency(),

                'in_stock' => $variation->is_in_stock(),

                'stock_quantity' => $variation->get_stock_quantity(),

                'stock_status' => $variation->get_stock_status(),

                'manage_stock' => $variation->get_manage_stock(),

                'purchasable' => $variation->is_purchasable(),

                'image' => $variation_image,

                'description' => wp_strip_all_tags(
                    $variation->get_description()
                ),
            ];
        }
    }

    /**
     * ---------------------------------------------------------
     * PRODUCT RESPONSE
     * ---------------------------------------------------------
     */

    return rest_ensure_response([
        'success' => true,

        'item' => [
            'id' => $product->get_id(),

            'name' => $product->get_name(),

            'slug' => $product->get_slug(),

            'type' => $product->get_type(),

            'description' => $product->get_description(),

            'short_description' => $product->get_short_description(),

            'price' => $product->get_price(),

            'regular_price' => $product->get_regular_price(),

            'sale_price' => $product->get_sale_price(),

            'currency' => get_woocommerce_currency(),

            'permalink' => get_permalink(
                $product->get_id()
            ),

            'image' => $images[0] ?? null,

            'images' => $images,

            'in_stock' => $product->is_in_stock(),

            'stock_status' => $product->get_stock_status(),

            'purchasable' => $product->is_purchasable(),

            'sku' => $product->get_sku(),

            'stock_quantity' => $product->get_stock_quantity(),

            'attributes' => $attributes,

            'variations' => $variations,
        ],
    ]);
}
