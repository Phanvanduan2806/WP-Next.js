<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * =========================================================
 * CHECKOUT API
 * =========================================================
 *
 * GET  /wp-json/nextjs/v1/checkout
 * POST /wp-json/nextjs/v1/checkout/validate
 * POST /wp-json/nextjs/v1/checkout
 *
 * Authentication:
 * Authorization: Bearer <token>
 *
 * Body:
 * {
 *   "billing": {
 *     "first_name": "Van",
 *     "last_name": "Duan",
 *     "email": "customer@example.com",
 *     "phone": "0900000000",
 *     "address_1": "123 Nguyen Van Linh",
 *     "city": "Da Nang",
 *     "country": "VN"
 *   },
 *   "shipping": {},
 *   "payment_method": "cod",
 *   "customer_note": ""
 * }
 */

/**
 * Register routes.
 */
add_action('rest_api_init', function () {

    register_rest_route('nextjs/v1', '/checkout', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'nextjs_get_checkout',
            'permission_callback' => 'nextjs_checkout_permission_check',
        ],
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'nextjs_process_checkout',
            'permission_callback' => 'nextjs_checkout_permission_check',
        ],
    ]);

    register_rest_route(
        'nextjs/v1',
        '/checkout/validate',
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'nextjs_validate_checkout',
            'permission_callback' => 'nextjs_checkout_permission_check',
        ]
    );
});

/**
 * Shared permission check.
 */
function nextjs_checkout_permission_check(
    WP_REST_Request $request
) {
    $available = nextjs_api_require_woocommerce();

    if (is_wp_error($available)) {
        return $available;
    }

    return nextjs_api_require_user($request);
}

/**
 * Get current authenticated user.
 */
function nextjs_checkout_get_user(
    WP_REST_Request $request
) {
    $user = nextjs_api_current_user($request);

    if (!$user) {
        return nextjs_api_error(
            'not_authenticated',
            'Vui lòng đăng nhập để tiếp tục.',
            401
        );
    }

    return $user;
}

/**
 * Initialize WooCommerce cart/session.
 *
 * This relies on the cart functions already implemented
 * by your theme.
 */
function nextjs_checkout_initialize_cart(
    WP_REST_Request $request
) {
    if (!function_exists('nextjs_cart_initialize')) {
        return nextjs_api_error(
            'cart_api_unavailable',
            'Module giỏ hàng chưa được tải.',
            500
        );
    }

    $result = nextjs_cart_initialize($request);

    if (is_wp_error($result)) {
        return $result;
    }

    if (!WC()->cart) {
        return nextjs_api_error(
            'cart_unavailable',
            'Không thể khởi tạo giỏ hàng.',
            500
        );
    }

    return WC()->cart;
}

/**
 * Sanitize an address payload.
 */
function nextjs_checkout_sanitize_address($address) {
    if (!is_array($address)) {
        return [];
    }

    $fields = [
        'first_name',
        'last_name',
        'company',
        'email',
        'phone',
        'address_1',
        'address_2',
        'city',
        'state',
        'postcode',
        'country',
    ];

    $result = [];

    foreach ($fields as $field) {
        $value = $address[$field] ?? '';

        if ($field === 'email') {
            $result[$field] = sanitize_email($value);
        } elseif ($field === 'country') {
            $result[$field] = strtoupper(
                sanitize_text_field($value)
            );
        } else {
            $result[$field] = sanitize_text_field($value);
        }
    }

    return $result;
}

/**
 * Get billing and shipping data.
 *
 * Shipping defaults to billing when not provided.
 */
function nextjs_checkout_get_addresses(
    WP_REST_Request $request,
    WP_User $user
) {
    $body = nextjs_api_body($request);

    $billing_input = (
        isset($body['billing']) &&
        is_array($body['billing'])
    ) ? $body['billing'] : [];

    $shipping_input = (
        isset($body['shipping']) &&
        is_array($body['shipping'])
    ) ? $body['shipping'] : [];

    $billing = nextjs_checkout_sanitize_address(
        $billing_input
    );

    $shipping = !empty($shipping_input)
        ? nextjs_checkout_sanitize_address($shipping_input)
        : $billing;

    // Use the authenticated account email as a fallback.
    if (empty($billing['email'])) {
        $billing['email'] = sanitize_email(
            $user->user_email
        );
    }

    return [
        'billing'  => $billing,
        'shipping' => $shipping,
    ];
}

/**
 * Validate checkout addresses and cart items.
 */
function nextjs_checkout_validate_data(
    $billing,
    $shipping,
    $cart
) {
    if (!$cart || $cart->is_empty()) {
        return nextjs_api_error(
            'empty_cart',
            'Giỏ hàng đang trống.',
            400
        );
    }

    if (
        empty($billing['first_name']) ||
        empty($billing['last_name']) ||
        empty($billing['email']) ||
        !is_email($billing['email'])
    ) {
        return nextjs_api_error(
            'invalid_billing',
            'Vui lòng nhập họ tên và email hợp lệ.',
            400
        );
    }

    if (
        !empty($billing['phone']) &&
        !preg_match('/^[0-9+\s().-]{7,25}$/', $billing['phone'])
    ) {
        return nextjs_api_error(
            'invalid_phone',
            'Số điện thoại không hợp lệ.',
            400
        );
    }

    foreach ($cart->get_cart() as $cart_item) {
        $product = $cart_item['data'] ?? null;
        $quantity = absint($cart_item['quantity'] ?? 0);

        if (
            !$product instanceof WC_Product ||
            !$product->exists() ||
            !$product->is_purchasable() ||
            $quantity < 1
        ) {
            return nextjs_api_error(
                'invalid_cart_item',
                'Có sản phẩm không hợp lệ trong giỏ hàng.',
                400
            );
        }

        if (!$product->is_in_stock()) {
            return nextjs_api_error(
                'product_out_of_stock',
                sprintf(
                    'Sản phẩm "%s" đã hết hàng.',
                    $product->get_name()
                ),
                400
            );
        }

        if (!$product->has_enough_stock($quantity)) {
            return nextjs_api_error(
                'insufficient_stock',
                sprintf(
                    'Sản phẩm "%s" không đủ số lượng.',
                    $product->get_name()
                ),
                400
            );
        }
    }

    return true;
}

/**
 * Get available payment gateways.
 */
function nextjs_checkout_get_payment_methods() {
    $gateways = WC()->payment_gateways()
        ->get_available_payment_gateways();

    $methods = [];

    foreach ($gateways as $gateway) {
        $methods[] = [
            'id'          => (string) $gateway->id,
            'title'       => wp_strip_all_tags(
                $gateway->get_title()
            ),
            'description' => wp_strip_all_tags(
                $gateway->get_description()
            ),
            'enabled'     => (
                $gateway->enabled === 'yes'
            ),
        ];
    }

    return $methods;
}

/**
 * Format checkout totals and cart items.
 */
function nextjs_checkout_format_cart($cart) {
    $items = [];

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        $product = $cart_item['data'] ?? null;

        if (!$product instanceof WC_Product) {
            continue;
        }

        $image_url = '';

        $image_id = $product->get_image_id();

        if ($image_id) {
            $image_url = wp_get_attachment_image_url(
                $image_id,
                'woocommerce_thumbnail'
            );
        }

        $items[] = [
            'key'         => (string) $cart_item_key,
            'product_id'  => (int) $product->get_id(),
            'name'        => $product->get_name(),
            'quantity'    => (int) $cart_item['quantity'],
            'price'       => (string) wc_get_price_to_display(
                $product
            ),
            'line_subtotal' => (string) $cart_item['line_subtotal'],
            'line_total'    => (string) $cart_item['line_total'],
            'image'         => $image_url ?: '',
        ];
    }

    return [
        'items' => $items,
        'totals' => [
            'subtotal' => (string) $cart->get_subtotal(),
            'discount' => (string) $cart->get_discount_total(),
            'shipping' => (string) $cart->get_shipping_total(),
            'tax'      => (string) $cart->get_total_tax(),
            'total'    => (string) $cart->get_total('edit'),
            'currency' => (string) get_woocommerce_currency(),
        ],
        'item_count' => (int) $cart->get_cart_contents_count(),
    ];
}

/**
 * GET /checkout
 *
 * Return current cart, account addresses and payment methods.
 */
function nextjs_get_checkout(
    WP_REST_Request $request
) {
    $user = nextjs_checkout_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $cart = nextjs_checkout_initialize_cart($request);

    if (is_wp_error($cart)) {
        return $cart;
    }

    $cart->calculate_totals();

    $billing = [
        'first_name' => get_user_meta(
            $user->ID,
            'billing_first_name',
            true
        ),
        'last_name' => get_user_meta(
            $user->ID,
            'billing_last_name',
            true
        ),
        'email' => get_user_meta(
            $user->ID,
            'billing_email',
            true
        ) ?: $user->user_email,
        'phone' => get_user_meta(
            $user->ID,
            'billing_phone',
            true
        ),
        'address_1' => get_user_meta(
            $user->ID,
            'billing_address_1',
            true
        ),
        'address_2' => get_user_meta(
            $user->ID,
            'billing_address_2',
            true
        ),
        'city' => get_user_meta(
            $user->ID,
            'billing_city',
            true
        ),
        'state' => get_user_meta(
            $user->ID,
            'billing_state',
            true
        ),
        'postcode' => get_user_meta(
            $user->ID,
            'billing_postcode',
            true
        ),
        'country' => get_user_meta(
            $user->ID,
            'billing_country',
            true
        ) ?: 'VN',
    ];

    $shipping = [
        'first_name' => get_user_meta(
            $user->ID,
            'shipping_first_name',
            true
        ),
        'last_name' => get_user_meta(
            $user->ID,
            'shipping_last_name',
            true
        ),
        'address_1' => get_user_meta(
            $user->ID,
            'shipping_address_1',
            true
        ),
        'address_2' => get_user_meta(
            $user->ID,
            'shipping_address_2',
            true
        ),
        'city' => get_user_meta(
            $user->ID,
            'shipping_city',
            true
        ),
        'state' => get_user_meta(
            $user->ID,
            'shipping_state',
            true
        ),
        'postcode' => get_user_meta(
            $user->ID,
            'shipping_postcode',
            true
        ),
        'country' => get_user_meta(
            $user->ID,
            'shipping_country',
            true
        ) ?: 'VN',
    ];

    return rest_ensure_response([
        'success' => true,
        'customer' => [
            'id'    => (int) $user->ID,
            'name'  => $user->display_name,
            'email' => $user->user_email,
        ],
        'billing' => $billing,
        'shipping' => $shipping,
        'cart' => nextjs_checkout_format_cart($cart),
        'payment_methods' => nextjs_checkout_get_payment_methods(),
    ]);
}

/**
 * POST /checkout/validate
 *
 * Validate checkout data without creating an order.
 */
function nextjs_validate_checkout(
    WP_REST_Request $request
) {
    $user = nextjs_checkout_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $cart = nextjs_checkout_initialize_cart($request);

    if (is_wp_error($cart)) {
        return $cart;
    }

    $addresses = nextjs_checkout_get_addresses(
        $request,
        $user
    );

    $cart->calculate_totals();

    $validation = nextjs_checkout_validate_data(
        $addresses['billing'],
        $addresses['shipping'],
        $cart
    );

    if (is_wp_error($validation)) {
        return $validation;
    }

    return rest_ensure_response([
        'success' => true,
        'message' => 'Thông tin checkout hợp lệ.',
        'cart' => nextjs_checkout_format_cart($cart),
    ]);
}

/**
 * POST /checkout
 *
 * Create an order from the current WooCommerce cart.
 *
 * The endpoint does not capture payment.
 */
function nextjs_process_checkout(
    WP_REST_Request $request
) {
    $user = nextjs_checkout_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $cart = nextjs_checkout_initialize_cart($request);

    if (is_wp_error($cart)) {
        return $cart;
    }

    $body = nextjs_api_body($request);

    $addresses = nextjs_checkout_get_addresses(
        $request,
        $user
    );

    $billing = $addresses['billing'];
    $shipping = $addresses['shipping'];

    $cart->calculate_totals();

    $validation = nextjs_checkout_validate_data(
        $billing,
        $shipping,
        $cart
    );

    if (is_wp_error($validation)) {
        return $validation;
    }

    $payment_method = sanitize_key(
        $body['payment_method'] ?? ''
    );

    $available_gateways = WC()->payment_gateways()
        ->get_available_payment_gateways();

    if (
        $payment_method === '' ||
        !isset($available_gateways[$payment_method])
    ) {
        return nextjs_api_error(
            'invalid_payment_method',
            'Vui lòng chọn phương thức thanh toán hợp lệ.',
            400
        );
    }

    $customer_note = sanitize_textarea_field(
        $body['customer_note'] ?? ''
    );

    $order = null;

    try {
        $order = wc_create_order([
            'customer_id' => (int) $user->ID,
            'status'      => 'pending',
        ]);

        if (is_wp_error($order)) {
            return $order;
        }

        if (!$order instanceof WC_Order) {
            throw new Exception(
                'WooCommerce failed to create an order.'
            );
        }

        foreach ($cart->get_cart() as $cart_item) {
            $product = $cart_item['data'];
            $quantity = (int) $cart_item['quantity'];

            $item_id = $order->add_product(
                $product,
                $quantity
            );

            if (!$item_id) {
                throw new Exception(
                    'Unable to add a product to the order.'
                );
            }
        }

        $order->set_address($billing, 'billing');
        $order->set_address($shipping, 'shipping');

        $order->set_currency(
            get_woocommerce_currency()
        );

        $order->set_customer_note($customer_note);

        $order->set_payment_method(
            $available_gateways[$payment_method]
        );

        $order->set_payment_method_title(
            $available_gateways[$payment_method]->get_title()
        );

        // Calculate totals from server-side product data.
        $order->calculate_totals();

        $order->update_meta_data(
            '_nextjs_created_order',
            'yes'
        );

        $order->save();

        /**
         * Persist billing/shipping data to the customer profile.
         */
        foreach ($billing as $field => $value) {
            update_user_meta(
                $user->ID,
                'billing_' . $field,
                $value
            );
        }

        foreach ($shipping as $field => $value) {
            update_user_meta(
                $user->ID,
                'shipping_' . $field,
                $value
            );
        }

        /**
         * Create the order only; payment is handled separately.
         *
         * Do not mark the order as paid here.
         * Do not call payment_complete() here.
         */
        $order_id = $order->get_id();

        // Empty the cart only after order creation succeeds.
        $cart->empty_cart(true);

        if (function_exists('nextjs_cart_save_session')) {
            nextjs_cart_save_session();
        }

        $order = wc_get_order($order_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Tạo đơn hàng thành công.',
            'item' => [
                'id' => (int) $order->get_id(),
                'number' => (string) $order->get_order_number(),
                'status' => (string) $order->get_status(),
                'total' => (string) $order->get_total(),
                'currency' => (string) $order->get_currency(),
                'payment_method' => (string) $order->get_payment_method(),
                'payment_title' => (string) $order->get_payment_method_title(),
                'payment_url' => $order->get_checkout_payment_url(),
                'order_received_url' => $order->get_checkout_order_received_url(),
            ],
        ], 201);

    } catch (Throwable $exception) {
        error_log(
            '[NextJs Checkout] Create failed: ' .
            $exception->getMessage()
        );

        if (
            $order instanceof WC_Order &&
            $order->get_id()
        ) {
            $order->delete(true);
        }

        return nextjs_api_error(
            'checkout_failed',
            'Không thể tạo đơn hàng. Vui lòng thử lại.',
            500
        );
    }
}
