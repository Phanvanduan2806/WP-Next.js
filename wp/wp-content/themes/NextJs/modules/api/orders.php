<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * =========================================================
 * ORDER API
 * =========================================================
 *
 * GET  /wp-json/nextjs/v1/orders
 * GET  /wp-json/nextjs/v1/orders/{id}
 * POST /wp-json/nextjs/v1/orders
 * POST /wp-json/nextjs/v1/orders/{id}/cancel
 * POST /wp-json/nextjs/v1/orders/{id}/pay
 */

/**
 * =========================================================
 * PAYMENT STATUS SUPPORT
 * =========================================================
 *
 * WooCommerce mặc định chỉ cho thanh toán lại với một số
 * trạng thái nhất định, thường là pending và failed.
 *
 * Cho phép đơn on-hold do Next.js API tạo tiếp tục thanh toán
 * nếu đơn chưa được thanh toán.
 *
 * Chỉ áp dụng cho đơn có meta _nextjs_created_order = yes,
 * không thay đổi hành vi thanh toán của các đơn khác.
 */

add_filter(
    'woocommerce_valid_order_statuses_for_payment',
    'nextjs_orders_allow_payment_on_hold',
    10,
    2
);

function nextjs_orders_allow_payment_on_hold($statuses, $order)
{
    if (
        $order instanceof WC_Order &&
        $order->has_status('on-hold') &&
        $order->get_meta('_nextjs_created_order') === 'yes' &&
        !$order->is_paid() &&
        !$order->get_date_paid()
    ) {
        $statuses[] = 'on-hold';
    }

    return array_values(array_unique($statuses));
}


/**
 * =========================================================
 * REGISTER ROUTES
 * =========================================================
 */

add_action('rest_api_init', function () {

    // GET orders / POST create order.
    register_rest_route('nextjs/v1', '/orders', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'nextjs_get_customer_orders',
            'permission_callback' => 'nextjs_orders_permission_check',
            'args' => [
                'page' => [
                    'default' => 1,
                    'sanitize_callback' => 'absint',
                ],
                'per_page' => [
                    'default' => 10,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ],
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nextjs_create_customer_order',
            'permission_callback' => 'nextjs_orders_permission_check',
        ],
    ]);

    // GET order detail.
    register_rest_route('nextjs/v1', '/orders/(?P<id>\d+)', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'nextjs_get_customer_order',
            'permission_callback' => 'nextjs_orders_permission_check',
            'args' => [
                'id' => [
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ],
    ]);

    // POST cancel order.
    register_rest_route('nextjs/v1', '/orders/(?P<id>\d+)/cancel', [
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nextjs_cancel_customer_order',
            'permission_callback' => 'nextjs_orders_permission_check',
            'args' => [
                'id' => [
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ],
    ]);

    // POST prepare payment.
    register_rest_route('nextjs/v1', '/orders/(?P<id>\d+)/pay', [
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nextjs_pay_customer_order',
            'permission_callback' => 'nextjs_orders_permission_check',
            'args' => [
                'id' => [
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ],
    ]);
});


/**
 * =========================================================
 * AUTHENTICATION
 * =========================================================
 */

/**
 * Check WooCommerce and customer authentication.
 */
function nextjs_orders_permission_check(WP_REST_Request $request)
{
    $available = nextjs_api_require_woocommerce();

    if (is_wp_error($available)) {
        return $available;
    }

    return nextjs_api_require_user($request);
}


/**
 * Get authenticated user.
 */
function nextjs_orders_get_user(WP_REST_Request $request)
{
    $user = nextjs_api_current_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    if (!$user || !isset($user->ID)) {
        return nextjs_api_error(
            'not_authenticated',
            'Vui lòng đăng nhập để tiếp tục.',
            401
        );
    }

    return $user;
}


/**
 * =========================================================
 * ORDER HELPERS
 * =========================================================
 */

/**
 * Verify that the order belongs to the authenticated customer.
 */
function nextjs_get_owned_order($order_id, $user_id)
{
    $order_id = absint($order_id);
    $user_id = absint($user_id);

    if (!$order_id || !$user_id) {
        return nextjs_api_error(
            'invalid_order',
            'Thông tin đơn hàng không hợp lệ.',
            400
        );
    }

    $order = wc_get_order($order_id);

    if (!$order instanceof WC_Order) {
        return nextjs_api_error(
            'order_not_found',
            'Không tìm thấy đơn hàng.',
            404
        );
    }

    if ((int) $order->get_customer_id() !== $user_id) {
        return nextjs_api_error(
            'order_forbidden',
            'Bạn không có quyền truy cập đơn hàng này.',
            403
        );
    }

    return $order;
}


/**
 * Check whether an order is eligible for payment.
 */
function nextjs_order_is_payable($order)
{
    if (!$order instanceof WC_Order) {
        return false;
    }

    $payable_statuses = [
        'pending',
        'failed',
        'on-hold',
    ];

    if (!$order->has_status($payable_statuses)) {
        return false;
    }

    // Never offer payment for an order that has already been paid.
    if ($order->is_paid() || $order->get_date_paid()) {
        return false;
    }

    // WooCommerce validates payment eligibility, including filters.
    return $order->needs_payment();
}


/**
 * Format order data for Next.js.
 */
function nextjs_format_customer_order($order)
{
    if (!$order instanceof WC_Order) {
        return null;
    }

    $line_items = [];

    foreach ($order->get_items('line_item') as $item_id => $item) {
        $product = $item->get_product();
        $image_url = '';

        if ($product) {
            $image_id = $product->get_image_id();

            if ($image_id) {
                $image = wp_get_attachment_image_url(
                    $image_id,
                    'woocommerce_thumbnail'
                );

                if ($image) {
                    $image_url = $image;
                }
            }
        }

        $line_items[] = [
            'id' => (int) $item_id,
            'product_id' => (int) $item->get_product_id(),
            'variation_id' => (int) $item->get_variation_id(),
            'name' => (string) $item->get_name(),
            'quantity' => (int) $item->get_quantity(),
            'subtotal' => (string) $item->get_subtotal(),
            'total' => (string) $item->get_total(),
            'image' => $image_url,
        ];
    }

    $date_created = $order->get_date_created();
    $payment_url = '';

    if (nextjs_order_is_payable($order)) {
        $payment_url = $order->get_checkout_payment_url();
    }

    return [
        'id' => (int) $order->get_id(),
        'number' => (string) $order->get_order_number(),
        'status' => (string) $order->get_status(),
        'status_label' => (string) wc_get_order_status_name(
            $order->get_status()
        ),
        'date_created' => $date_created
            ? $date_created->date('c')
            : null,
        'total' => (string) $order->get_total(),
        'subtotal' => (string) $order->get_subtotal(),
        'discount_total' => (string) $order->get_discount_total(),
        'shipping_total' => (string) $order->get_shipping_total(),
        'total_tax' => (string) $order->get_total_tax(),
        'currency' => (string) $order->get_currency(),
        'payment_method' => (string) $order->get_payment_method(),
        'payment_title' => (string) $order->get_payment_method_title(),
        'payment_url' => $payment_url,
        'line_items' => $line_items,
    ];
}


/**
 * =========================================================
 * GET CUSTOMER ORDERS
 * =========================================================
 *
 * GET /orders?page=1&per_page=10
 */

function nextjs_get_customer_orders(WP_REST_Request $request)
{
    $user = nextjs_orders_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $page = max(
        1,
        absint($request->get_param('page') ?: 1)
    );

    $per_page = min(
        50,
        max(
            1,
            absint($request->get_param('per_page') ?: 10)
        )
    );

    $query = wc_get_orders([
        'customer_id' => (int) $user->ID,
        'limit' => $per_page,
        'page' => $page,
        'paginate' => true,
        'orderby' => 'date',
        'order' => 'DESC',
        'return' => 'objects',
    ]);

    $items = [];

    foreach ($query->orders as $order) {
        $formatted_order = nextjs_format_customer_order($order);

        if ($formatted_order !== null) {
            $items[] = $formatted_order;
        }
    }

    return rest_ensure_response([
        'success' => true,
        'items' => $items,
        'total' => (int) $query->total,
        'total_pages' => (int) $query->max_num_pages,
        'current_page' => $page,
    ]);
}


/**
 * =========================================================
 * GET CUSTOMER ORDER DETAIL
 * =========================================================
 *
 * GET /orders/{id}
 */

function nextjs_get_customer_order(WP_REST_Request $request)
{
    $user = nextjs_orders_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $order = nextjs_get_owned_order(
        absint($request->get_param('id')),
        $user->ID
    );

    if (is_wp_error($order)) {
        return $order;
    }

    return rest_ensure_response([
        'success' => true,
        'item' => nextjs_format_customer_order($order),
    ]);
}


/**
 * =========================================================
 * CREATE CUSTOMER ORDER
 * =========================================================
 *
 * POST /orders
 *
 * Creates a pending order from the authenticated user's cart.
 * This endpoint does not process payment.
 */

function nextjs_create_customer_order(WP_REST_Request $request)
{
    $user = nextjs_orders_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $initialized = nextjs_cart_initialize($request);

    if (is_wp_error($initialized)) {
        return $initialized;
    }

    $cart = WC()->cart;

    if (!$cart || $cart->is_empty()) {
        return nextjs_api_error(
            'empty_cart',
            'Giỏ hàng đang trống.',
            400
        );
    }

    $body = nextjs_api_body($request);

    $billing = (
        isset($body['billing']) &&
        is_array($body['billing'])
    )
        ? $body['billing']
        : [];

    $first_name = sanitize_text_field(
        $billing['first_name'] ?? ''
    );

    $last_name = sanitize_text_field(
        $billing['last_name'] ?? ''
    );

    $email = sanitize_email(
        $billing['email'] ?? $user->user_email
    );

    $phone = sanitize_text_field(
        $billing['phone'] ?? ''
    );

    $address_1 = sanitize_text_field(
        $billing['address_1'] ?? ''
    );

    $address_2 = sanitize_text_field(
        $billing['address_2'] ?? ''
    );

    $city = sanitize_text_field(
        $billing['city'] ?? ''
    );

    $state = sanitize_text_field(
        $billing['state'] ?? ''
    );

    $postcode = sanitize_text_field(
        $billing['postcode'] ?? ''
    );

    $country = strtoupper(
        sanitize_text_field($billing['country'] ?? 'VN')
    );

    if (
        $first_name === '' ||
        $last_name === '' ||
        !is_email($email)
    ) {
        return nextjs_api_error(
            'invalid_billing',
            'Vui lòng cung cấp họ tên và email hợp lệ.',
            400
        );
    }

    // Validate products and recalculate prices on the server.
    $cart->calculate_totals();

    foreach ($cart->get_cart() as $cart_item) {
        $product = $cart_item['data'] ?? null;
        $quantity = (int) ($cart_item['quantity'] ?? 0);

        if (
            !$product instanceof WC_Product ||
            !$product->exists() ||
            $quantity <= 0 ||
            !$product->is_purchasable() ||
            !$product->is_in_stock() ||
            !$product->has_enough_stock($quantity)
        ) {
            return nextjs_api_error(
                'cart_validation_failed',
                'Có sản phẩm không còn đủ điều kiện mua. Vui lòng kiểm tra lại giỏ hàng.',
                400
            );
        }
    }

    $order = null;

    try {
        $order = wc_create_order([
            'customer_id' => (int) $user->ID,
            'status' => 'pending',
        ]);

        if (is_wp_error($order)) {
            return $order;
        }

        if (!$order instanceof WC_Order) {
            throw new Exception(
                'Unable to create WooCommerce order.'
            );
        }

        // Add products from the server-side cart.
        foreach ($cart->get_cart() as $cart_item) {
            $product = $cart_item['data'];
            $quantity = (int) $cart_item['quantity'];

            $item_id = $order->add_product(
                $product,
                $quantity
            );

            if (!$item_id) {
                throw new Exception(
                    'Unable to add cart item to order.'
                );
            }
        }

        $address = [
            'first_name' => $first_name,
            'last_name' => $last_name,
            'company' => sanitize_text_field(
                $billing['company'] ?? ''
            ),
            'email' => $email,
            'phone' => $phone,
            'address_1' => $address_1,
            'address_2' => $address_2,
            'city' => $city,
            'state' => $state,
            'postcode' => $postcode,
            'country' => $country,
        ];

        $order->set_address($address, 'billing');

        $shipping = (
            isset($body['shipping']) &&
            is_array($body['shipping'])
        )
            ? $body['shipping']
            : [];

        if (!empty($shipping)) {
            $shipping_address = [];

            $shipping_fields = [
                'first_name',
                'last_name',
                'company',
                'address_1',
                'address_2',
                'city',
                'state',
                'postcode',
                'country',
            ];

            foreach ($shipping_fields as $field) {
                $value = $shipping[$field] ?? '';

                $shipping_address[$field] = (
                    $field === 'country'
                )
                    ? strtoupper(sanitize_text_field($value))
                    : sanitize_text_field($value);
            }

            $order->set_address(
                $shipping_address,
                'shipping'
            );
        } else {
            $order->set_address($address, 'shipping');
        }

        $order->set_currency(
            get_woocommerce_currency()
        );

        $order->calculate_totals();

        $order->update_meta_data(
            '_nextjs_created_order',
            'yes'
        );

        $order->save();

        $order->set_status(
            'pending',
            'Đơn hàng được tạo qua Next.js API.'
        );

        $order->save();

        $order_id = $order->get_id();

        // Empty the cart only after successful order creation.
        $cart->empty_cart(true);
        nextjs_cart_save_session();

        $order = wc_get_order($order_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Tạo đơn hàng thành công.',
            'item' => nextjs_format_customer_order($order),
        ], 201);

    } catch (Throwable $exception) {
        error_log(
            '[NextJs Orders] Create failed: ' .
            $exception->getMessage()
        );

        if (
            $order instanceof WC_Order &&
            $order->get_id()
        ) {
            $order->delete(true);
        }

        return nextjs_api_error(
            'order_creation_failed',
            'Không thể tạo đơn hàng. Vui lòng thử lại.',
            500
        );
    }
}


/**
 * =========================================================
 * CANCEL CUSTOMER ORDER
 * =========================================================
 *
 * POST /orders/{id}/cancel
 */

function nextjs_cancel_customer_order(WP_REST_Request $request)
{
    $user = nextjs_orders_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    $order = nextjs_get_owned_order(
        absint($request->get_param('id')),
        $user->ID
    );

    if (is_wp_error($order)) {
        return $order;
    }

    if (
        !in_array(
            $order->get_status(),
            ['pending', 'on-hold'],
            true
        )
    ) {
        return nextjs_api_error(
            'order_cannot_be_cancelled',
            'Đơn hàng không thể hủy ở trạng thái hiện tại.',
            400
        );
    }

    try {
        $order->update_status(
            'cancelled',
            'Khách hàng yêu cầu hủy đơn hàng qua website.'
        );

        $order = wc_get_order($order->get_id());

        return rest_ensure_response([
            'success' => true,
            'message' => 'Đã hủy đơn hàng thành công.',
            'item' => nextjs_format_customer_order($order),
        ]);

    } catch (Throwable $exception) {
        error_log(
            '[NextJs Orders] Cancel failed: ' .
            $exception->getMessage()
        );

        return nextjs_api_error(
            'order_cancel_failed',
            'Không thể hủy đơn hàng lúc này.',
            500
        );
    }
}


/**
 * Khởi tạo hoặc lấy link thanh toán PayOS cho đơn hàng.
 *
 * POST /wp-json/nextjs/v1/orders/{id}/pay
 */

function nextjs_pay_customer_order(WP_REST_Request $request)
{
    // Dùng cơ chế xác thực REST hiện có của dự án.
    // Không dùng is_user_logged_in() vì request có thể xác thực
    // bằng Bearer token thay vì cookie đăng nhập WordPress.
    $user = nextjs_orders_get_user($request);

    if (is_wp_error($user)) {
        return $user;
    }

    if (!function_exists('WC') || !WC()) {
        return nextjs_api_error(
            'woocommerce_unavailable',
            'WooCommerce chưa sẵn sàng.',
            503
        );
    }

    $order_id = absint($request->get_param('id'));

    // Kiểm tra đơn hàng và quyền sở hữu như các API orders khác.
    $order = nextjs_get_owned_order($order_id, $user->ID);

    if (is_wp_error($order)) {
        return $order;
    }

    // Không tạo link thanh toán cho đơn đã thanh toán.
    if ($order->is_paid() || $order->get_date_paid()) {
        return nextjs_api_error(
            'order_already_paid',
            'Đơn hàng đã được thanh toán.',
            409
        );
    }

    // Chỉ cho phép thanh toán các trạng thái hợp lệ.
    if (!nextjs_order_is_payable($order)) {
        return nextjs_api_error(
            'order_not_payable',
            'Trạng thái đơn hàng không cho phép thanh toán.',
            400
        );
    }

    // Đảm bảo đơn hàng sử dụng gateway PayOS.
    if ('payos' !== $order->get_payment_method()) {
        return nextjs_api_error(
            'invalid_payment_method',
            'Đơn hàng không sử dụng phương thức thanh toán PayOS.',
            400
        );
    }

    // Lấy gateway từ WooCommerce, không sửa hoặc gọi trực tiếp API plugin.
    $payment_gateways = WC()->payment_gateways();
    $gateways = $payment_gateways
        ? $payment_gateways->payment_gateways()
        : [];

    $payos_gateway = $gateways['payos'] ?? null;

    if (
        !$payos_gateway ||
        !is_callable([
            $payos_gateway,
            'get_payos_payment_url',
        ])
    ) {
        return nextjs_api_error(
            'payos_gateway_unavailable',
            'Không tìm thấy gateway PayOS hoặc gateway chưa sẵn sàng.',
            503
        );
    }

    try {
        $payment_url = $payos_gateway->get_payos_payment_url(
            $order_id
        );
    } catch (Throwable $exception) {
        error_log(
            '[NextJS PayOS] Order ' . $order_id . ': ' .
            $exception->getMessage()
        );

        return nextjs_api_error(
            'payos_payment_error',
            'Không thể khởi tạo thanh toán. Vui lòng thử lại sau.',
            502
        );
    }

    if (
        !is_string($payment_url) ||
        trim($payment_url) === ''
    ) {
        return nextjs_api_error(
            'payment_url_unavailable',
            'PayOS chưa trả về link thanh toán hợp lệ.',
            502
        );
    }

    // Chỉ chấp nhận HTTPS và đúng tên miền thanh toán PayOS.
    $parsed_url = wp_parse_url($payment_url);

    if (
        empty($parsed_url['scheme']) ||
        strtolower($parsed_url['scheme']) !== 'https' ||
        empty($parsed_url['host']) ||
        strtolower($parsed_url['host']) !== 'pay.payos.vn'
    ) {
        error_log(
            '[NextJS PayOS] Invalid payment URL for order ' .
            $order_id
        );

        return nextjs_api_error(
            'invalid_payment_url',
            'Gateway trả về địa chỉ thanh toán không hợp lệ.',
            502
        );
    }

    // URL WooCommerce dùng để quay về sau khi thanh toán.
    // URL này có sẵn order key, không cần tự ghép ở FE.
    $return_url = $order->get_checkout_order_received_url();

    return rest_ensure_response([
        'success' => true,
        'order_id' => $order_id,
        'payment_url' => esc_url_raw($payment_url),
        'return_url' => esc_url_raw($return_url),
        'status' => $order->get_status(),
    ]);
}
