<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * =========================================================
 * CART API
 * =========================================================
 *
 * GET    /cart
 * POST   /cart/items
 * PATCH  /cart/items/{key}
 * DELETE /cart/items/{key}
 * DELETE /cart
 *
 * POST   /cart/coupons
 * DELETE /cart/coupons/{code}
 */

/**
 * Return the persistent coupon meta key for the current site.
 */
function nextjs_cart_coupon_meta_key()
{
    return '_nextjs_cart_coupons_' . get_current_blog_id();
}

/**
 * Initialize WooCommerce cart for the Bearer-authenticated user.
 */
function nextjs_cart_initialize(WP_REST_Request $request)
{
    $available = nextjs_api_require_woocommerce();

    if (is_wp_error($available)) {
        return $available;
    }

    $user = nextjs_api_current_user($request);

    if (!$user) {
        return nextjs_api_error(
            'not_authenticated',
            'Vui lòng đăng nhập để sử dụng giỏ hàng.',
            401
        );
    }

    wp_set_current_user((int) $user->ID);

    if (function_exists('wc_load_cart')) {
        wc_load_cart();
    }

    if (!WC()->session || !WC()->cart) {
        return nextjs_api_error(
            'cart_unavailable',
            'Không thể khởi tạo giỏ hàng WooCommerce.',
            500
        );
    }

    /*
     * Restore only this authenticated user's persistent cart.
     */
    $meta_key = '_woocommerce_persistent_cart_' . get_current_blog_id();
    $persistent = get_user_meta($user->ID, $meta_key, true);

    $cart_data = (
        is_array($persistent) &&
        isset($persistent['cart']) &&
        is_array($persistent['cart'])
    ) ? $persistent['cart'] : [];

    /*
     * Coupons are stored separately because this API uses
     * authenticated-user persistent carts rather than relying
     * on a browser's WooCommerce session.
     */
    $coupon_codes = get_user_meta(
        $user->ID,
        nextjs_cart_coupon_meta_key(),
        true
    );

    if (!is_array($coupon_codes)) {
        $coupon_codes = [];
    }

    $coupon_codes = array_values(array_unique(array_filter(
        array_map(
            static function ($code) {
                return is_string($code)
                    ? wc_format_coupon_code(sanitize_text_field($code))
                    : '';
            },
            $coupon_codes
        )
    )));

    WC()->session->set('cart', $cart_data);
    WC()->session->set('applied_coupons', $coupon_codes);

    WC()->cart->get_cart_from_session();

    /*
     * Recalculate totals using actual products, coupon validity,
     * stock rules, taxes and WooCommerce discount rules.
     */
    WC()->cart->calculate_totals();

    /*
     * Save the coupon list WooCommerce actually retained.
     * Invalid or expired coupons may have been removed during
     * cart calculation.
     */
    update_user_meta(
        $user->ID,
        nextjs_cart_coupon_meta_key(),
        WC()->cart->get_applied_coupons()
    );

    return $user;
}

/**
 * Persist the authenticated user's cart and applied coupons.
 */
function nextjs_cart_save_session()
{
    if (!function_exists('WC') || !WC()->cart || !WC()->session) {
        return;
    }

    $user_id = get_current_user_id();

    if ($user_id <= 0) {
        return;
    }

    $cart_data = WC()->cart->get_cart_for_session();

    $meta_key = '_woocommerce_persistent_cart_' . get_current_blog_id();

    update_user_meta($user_id, $meta_key, [
        'cart' => $cart_data,
    ]);

    update_user_meta(
        $user_id,
        nextjs_cart_coupon_meta_key(),
        WC()->cart->get_applied_coupons()
    );

    WC()->session->set('cart', $cart_data);
    WC()->session->set(
        'applied_coupons',
        WC()->cart->get_applied_coupons()
    );

    WC()->session->save_data();
}

/**
 * Format one cart item.
 */
function nextjs_cart_format_item($cart_item_key, $cart_item)
{
    $product = $cart_item['data'] ?? null;

    if (!$product instanceof WC_Product || !$product->exists()) {
        return null;
    }

    $product_id = (int) ($cart_item['product_id'] ?? $product->get_id());
    $variation_id = (int) ($cart_item['variation_id'] ?? 0);
    $quantity = (int) ($cart_item['quantity'] ?? 0);

    $image_id = $product->get_image_id();

    if (!$image_id && $product->get_parent_id()) {
        $image_id = get_post_thumbnail_id($product->get_parent_id());
    }

    $image_url = $image_id
        ? wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail')
        : wc_placeholder_img_src('woocommerce_thumbnail');

    $subtotal = (float) ($cart_item['line_subtotal'] ?? 0);
    $total = (float) ($cart_item['line_total'] ?? 0);

    return [
        'key'               => (string) $cart_item_key,
        'product_id'        => $product_id,
        'variation_id'      => $variation_id,
        'name'              => $product->get_name(),
        'slug'              => $product->get_slug(),
        'permalink'         => get_permalink(
            $product->get_parent_id() ?: $product_id
        ),
        'image'             => $image_url ?: '',
        'sku'               => $product->get_sku(),
        'quantity'          => $quantity,
        'price'             => (float) wc_get_price_to_display($product),
        'regular_price'     => (float) $product->get_regular_price(),
        'sale_price'        => $product->get_sale_price() !== ''
            ? (float) $product->get_sale_price()
            : null,
        'line_subtotal'     => $subtotal,
        'line_total'        => $total,
        'line_subtotal_tax' => (float) ($cart_item['line_subtotal_tax'] ?? 0),
        'line_tax'          => (float) ($cart_item['line_tax'] ?? 0),
        'price_html'        => $product->get_price_html(),
        'subtotal_html'     => wc_price($subtotal),
        'total_html'        => wc_price($total),
        'variation'         => isset($cart_item['variation']) &&
                               is_array($cart_item['variation'])
            ? $cart_item['variation']
            : new stdClass(),
    ];
}

/**
 * Format applied coupons.
 */
function nextjs_cart_format_coupons()
{
    $cart = WC()->cart;
    $coupons = [];

    if (!$cart) {
        return $coupons;
    }

    foreach ($cart->get_applied_coupons() as $code) {
        $coupon = new WC_Coupon($code);

        $coupons[] = [
            'code' => (string) $code,
            'discount_amount' => (float) $cart->get_coupon_discount_amount($code),
            'discount_type' => $coupon->get_discount_type(),
        ];
    }

    return $coupons;
}

/**
 * Build cart response.
 */
function nextjs_cart_response()
{
    $cart = WC()->cart;

    if (!$cart) {
        return nextjs_api_error(
            'cart_unavailable',
            'Giỏ hàng chưa được khởi tạo.',
            500
        );
    }

    $cart->calculate_totals();
    $items = [];

    foreach ($cart->get_cart() as $key => $cart_item) {
        $item = nextjs_cart_format_item($key, $cart_item);

        if ($item !== null) {
            $items[] = $item;
        }
    }

    return rest_ensure_response([
        'success' => true,
        'user_id' => get_current_user_id(),
        'items'   => $items,
        'coupons' => nextjs_cart_format_coupons(),
        'totals'  => [
            'subtotal'            => (float) $cart->get_subtotal(),
            'discount_total'      => (float) $cart->get_discount_total(),
            'discount_tax'        => (float) $cart->get_discount_tax(),
            'shipping_total'      => (float) $cart->get_shipping_total(),
            'shipping_tax'        => (float) $cart->get_shipping_tax(),
            'fee_total'           => (float) $cart->get_fee_total(),
            'fee_tax'             => (float) $cart->get_fee_tax(),
            'cart_contents_total' => (float) $cart->get_cart_contents_total(),
            'cart_contents_tax'   => (float) $cart->get_cart_contents_tax(),
            'total_tax'           => (float) $cart->get_total_tax(),
            'total'               => (float) $cart->get_total('edit'),
            'currency'            => get_woocommerce_currency(),
            'currency_symbol'     => get_woocommerce_currency_symbol(),
            'count'               => (int) $cart->get_cart_contents_count(),
        ],
    ]);
}

/**
 * GET /cart
 */
function nextjs_cart_get(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    return nextjs_cart_response();
}

/**
 * POST /cart/items
 */
function nextjs_cart_add_item(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    $body = nextjs_api_body($request);

    $product_id = absint($body['product_id'] ?? 0);
    $quantity = absint($body['quantity'] ?? 1);
    $variation_id = absint($body['variation_id'] ?? 0);
    $variation = $body['variation'] ?? [];

    if ($product_id <= 0 || $quantity <= 0 || !is_array($variation)) {
        return nextjs_api_error(
            'invalid_cart_item',
            'Thông tin sản phẩm hoặc số lượng không hợp lệ.',
            400
        );
    }

    $product = wc_get_product($variation_id ?: $product_id);

    if (!$product || !$product->exists()) {
        return nextjs_api_error(
            'product_not_found',
            'Không tìm thấy sản phẩm.',
            404
        );
    }

    $key = WC()->cart->add_to_cart(
        $product_id,
        $quantity,
        $variation_id,
        $variation
    );

    if (!$key) {
        return nextjs_api_error(
            'add_to_cart_failed',
            'Không thể thêm sản phẩm. Hãy kiểm tra tồn kho, biến thể và điều kiện mua hàng.',
            400
        );
    }

    nextjs_cart_save_session();

    return nextjs_cart_response();
}

/**
 * PATCH /cart/items/{key}
 */
function nextjs_cart_update_item(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    $key = (string) $request->get_param('key');
    $body = nextjs_api_body($request);

    if (
        !array_key_exists('quantity', $body) ||
        !is_numeric($body['quantity']) ||
        (string) (int) $body['quantity'] !== (string) $body['quantity'] ||
        (int) $body['quantity'] < 0
    ) {
        return nextjs_api_error(
            'invalid_quantity',
            'quantity phải là số nguyên lớn hơn hoặc bằng 0.',
            400
        );
    }

    if (!isset(WC()->cart->get_cart()[$key])) {
        return nextjs_api_error(
            'cart_item_not_found',
            'Không tìm thấy sản phẩm trong giỏ hàng.',
            404
        );
    }

    $quantity = (int) $body['quantity'];

    if ($quantity === 0) {
        WC()->cart->remove_cart_item($key);
    } else {
        $updated = WC()->cart->set_quantity($key, $quantity, true);

        if ($updated === false) {
            return nextjs_api_error(
                'quantity_update_failed',
                'Không thể cập nhật số lượng.',
                400
            );
        }
    }

    nextjs_cart_save_session();

    return nextjs_cart_response();
}

/**
 * DELETE /cart/items/{key}
 */
function nextjs_cart_remove_item(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    $key = (string) $request->get_param('key');
    $items = WC()->cart->get_cart();

    if (!isset($items[$key])) {
        return nextjs_api_error(
            'cart_item_not_found',
            'Không tìm thấy sản phẩm trong giỏ hàng.',
            404
        );
    }

    WC()->cart->remove_cart_item($key);
    nextjs_cart_save_session();

    return nextjs_cart_response();
}

/**
 * DELETE /cart
 */
function nextjs_cart_clear(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    WC()->cart->empty_cart(true);
    nextjs_cart_save_session();

    return nextjs_cart_response();
}

/**
 * POST /cart/coupons
 *
 * Body: { "code": "SALE10" }
 */
function nextjs_cart_apply_coupon(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    $body = nextjs_api_body($request);
    $raw_code = $body['code'] ?? '';

    if (!is_string($raw_code) || trim($raw_code) === '') {
        return nextjs_api_error(
            'invalid_coupon_code',
            'Vui lòng nhập mã giảm giá.',
            400
        );
    }

    $code = wc_format_coupon_code(sanitize_text_field(trim($raw_code)));

    if ($code === '') {
        return nextjs_api_error(
            'invalid_coupon_code',
            'Mã giảm giá không hợp lệ.',
            400
        );
    }

    if (WC()->cart->has_discount($code)) {
        return nextjs_api_error(
            'coupon_already_applied',
            'Mã giảm giá này đã được áp dụng.',
            400
        );
    }

    $applied = WC()->cart->apply_coupon($code);

    if (!$applied) {
        $messages = [];

        if (function_exists('wc_get_notices')) {
            foreach (wc_get_notices('error') as $notice) {
                $message = is_array($notice)
                    ? ($notice['notice'] ?? '')
                    : '';

                if (is_string($message) && $message !== '') {
                    $messages[] = wp_strip_all_tags($message);
                }
            }
        }

        if (function_exists('wc_clear_notices')) {
            wc_clear_notices();
        }

        return nextjs_api_error(
            'coupon_apply_failed',
            !empty($messages)
                ? implode(' ', array_unique($messages))
                : 'Không thể áp dụng mã giảm giá. Vui lòng kiểm tra mã và điều kiện sử dụng.',
            400
        );
    }

    nextjs_cart_save_session();

    return nextjs_cart_response();
}

/**
 * DELETE /cart/coupons/{code}
 */
function nextjs_cart_remove_coupon(WP_REST_Request $request)
{
    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    $code = wc_format_coupon_code(
        sanitize_text_field((string) $request->get_param('code'))
    );

    if ($code === '') {
        return nextjs_api_error(
            'invalid_coupon_code',
            'Mã giảm giá không hợp lệ.',
            400
        );
    }

    if (!WC()->cart->has_discount($code)) {
        return nextjs_api_error(
            'coupon_not_applied',
            'Mã giảm giá này không có trong giỏ hàng.',
            404
        );
    }

    WC()->cart->remove_coupon($code);
    nextjs_cart_save_session();

    return nextjs_cart_response();
}

/**
 * Register routes.
 */
add_action('rest_api_init', function () {
    register_rest_route('nextjs/v1', '/cart', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'nextjs_cart_get',
            'permission_callback' => 'nextjs_api_require_user',
        ],
        [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => 'nextjs_cart_clear',
            'permission_callback' => 'nextjs_api_require_user',
        ],
    ]);

    register_rest_route('nextjs/v1', '/cart/items', [
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'nextjs_cart_add_item',
            'permission_callback' => 'nextjs_api_require_user',
        ],
    ]);

    register_rest_route(
        'nextjs/v1',
        '/cart/items/(?P<key>[a-fA-F0-9]{32})',
        [
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => 'nextjs_cart_update_item',
                'permission_callback' => 'nextjs_api_require_user',
                'args'                => [
                    'key' => [
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => 'nextjs_cart_remove_item',
                'permission_callback' => 'nextjs_api_require_user',
                'args'                => [
                    'key' => [
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ],
        ]
    );

    register_rest_route('nextjs/v1', '/cart/coupons', [
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'nextjs_cart_apply_coupon',
            'permission_callback' => 'nextjs_api_require_user',
        ],
    ]);

    register_rest_route(
        'nextjs/v1',
        '/cart/coupons/(?P<code>[^/]+)',
        [
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => 'nextjs_cart_remove_coupon',
                'permission_callback' => 'nextjs_api_require_user',
                'args'                => [
                    'code' => [
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ],
        ]
    );
});
