<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * =========================================================
 * API HELPERS
 * =========================================================
 */

if (!function_exists('nextjs_api_error')) {
    function nextjs_api_error($code, $message, $status = 400, $extra = [])
    {
        return new WP_Error(
            $code,
            $message,
            array_merge(['status' => (int) $status], $extra)
        );
    }
}

if (!function_exists('nextjs_api_body')) {
    function nextjs_api_body(WP_REST_Request $request)
    {
        $body = $request->get_json_params();
        return is_array($body) ? $body : [];
    }
}

if (!function_exists('nextjs_api_user_data')) {
    function nextjs_api_user_data($user)
    {
        if (!$user instanceof WP_User || !$user->exists()) {
            return null;
        }

        return [
            'id'       => (int) $user->ID,
            'username' => $user->user_login,
            'name'     => $user->display_name,
            'email'    => $user->user_email,
            'avatar'   => get_avatar_url($user->ID),
        ];
    }
}

/**
 * Read Bearer token.
 */
if (!function_exists('nextjs_api_bearer_token')) {
    function nextjs_api_bearer_token(WP_REST_Request $request)
    {
        $authorization = $request->get_header('authorization');

        // Support servers that do not forward Authorization normally.
        if (!$authorization && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authorization = sanitize_text_field(
                wp_unslash($_SERVER['HTTP_AUTHORIZATION'])
            );
        }

        if (
            !is_string($authorization) ||
            !preg_match('/^Bearer\s+(\S+)$/i', trim($authorization), $matches)
        ) {
            return null;
        }

        return $matches[1];
    }
}

/**
 * Use a token hash as the server-side session key.
 */
if (!function_exists('nextjs_api_session_key')) {
    function nextjs_api_session_key($token)
    {
        return 'nextjs_session_' . hash('sha256', $token);
    }
}

/**
 * Get the authenticated WordPress user.
 *
 * Returns WP_User or null.
 */
if (!function_exists('nextjs_api_current_user')) {
    function nextjs_api_current_user(WP_REST_Request $request)
    {
        $token = nextjs_api_bearer_token($request);

        if (!$token) {
            return null;
        }

        $user_id = get_transient(nextjs_api_session_key($token));

        if (!$user_id || !is_numeric($user_id)) {
            return null;
        }

        $user = get_user_by('id', (int) $user_id);

        if (!$user instanceof WP_User || !$user->exists()) {
            delete_transient(nextjs_api_session_key($token));
            return null;
        }

        return $user;
    }
}

/**
 * Permission callback for authenticated endpoints.
 */
if (!function_exists('nextjs_api_require_user')) {
    function nextjs_api_require_user(WP_REST_Request $request)
    {
        if (!nextjs_api_current_user($request)) {
            return nextjs_api_error(
                'not_authenticated',
                'Vui lòng đăng nhập để tiếp tục.',
                401
            );
        }

        return true;
    }
}

/**
 * Revoke the current token.
 */
if (!function_exists('nextjs_api_revoke_session')) {
    function nextjs_api_revoke_session(WP_REST_Request $request)
    {
        $token = nextjs_api_bearer_token($request);

        if (!$token) {
            return false;
        }

        delete_transient(nextjs_api_session_key($token));

        return true;
    }
}

/**
 * Store a new server-side session.
 */
if (!function_exists('nextjs_api_create_session')) {
    function nextjs_api_create_session($user_id)
    {
        $user = get_user_by('id', (int) $user_id);

        if (!$user instanceof WP_User || !$user->exists()) {
            return nextjs_api_error(
                'invalid_user',
                'Tài khoản không hợp lệ.',
                400
            );
        }

        try {
            // 256-bit random bearer token.
            $token = bin2hex(random_bytes(32));
        } catch (Throwable $exception) {
            return nextjs_api_error(
                'token_generation_failed',
                'Không thể tạo phiên đăng nhập.',
                500
            );
        }

        $expires_in = 7 * DAY_IN_SECONDS;

        set_transient(
            nextjs_api_session_key($token),
            (int) $user->ID,
            $expires_in
        );

        return [
            'token'      => $token,
            'expires_in' => $expires_in,
            'user'       => $user,
        ];
    }
}

/**
 * Validate WooCommerce availability.
 */
if (!function_exists('nextjs_api_require_woocommerce')) {
    function nextjs_api_require_woocommerce()
    {
        if (
            !function_exists('WC') ||
            !class_exists('WooCommerce') ||
            !function_exists('wc_get_product') ||
            !function_exists('wc_get_orders')
        ) {
            return nextjs_api_error(
                'woocommerce_unavailable',
                'WooCommerce chưa sẵn sàng.',
                503
            );
        }

        return true;
    }
}