<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * POST /wp-json/nextjs/v1/auth/login
 * GET  /wp-json/nextjs/v1/auth/me
 * POST /wp-json/nextjs/v1/auth/logout
 */

add_action('rest_api_init', function () {
    register_rest_route('nextjs/v1', '/auth/login', [
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'nextjs_auth_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('nextjs/v1', '/auth/me', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'nextjs_auth_me',
        'permission_callback' => 'nextjs_api_require_user',
    ]);

    register_rest_route('nextjs/v1', '/auth/logout', [
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'nextjs_auth_logout',
        'permission_callback' => 'nextjs_api_require_user',
    ]);
});

/**
 * Login with WordPress username or email.
 */
function nextjs_auth_login(WP_REST_Request $request)
{
    $body = nextjs_api_body($request);

    $login = isset($body['username']) && is_string($body['username'])
        ? trim($body['username'])
        : '';

    $password = $body['password'] ?? '';

    if ($login === '' || !is_string($password) || $password === '') {
        return nextjs_api_error(
            'missing_credentials',
            'Vui lòng nhập tài khoản/email và mật khẩu.',
            400
        );
    }

    // Resolve email to username when an email was supplied.
    if (is_email($login)) {
        $account = get_user_by('email', sanitize_email($login));

        if ($account instanceof WP_User) {
            $login = $account->user_login;
        }
    } else {
        $login = sanitize_user($login, true);
    }

    $user = wp_authenticate($login, $password);

    if (is_wp_error($user) || !$user instanceof WP_User) {
        return nextjs_api_error(
            'invalid_credentials',
            'Tài khoản hoặc mật khẩu không chính xác.',
            401
        );
    }

    $session = nextjs_api_create_session($user->ID);

    if (is_wp_error($session)) {
        return $session;
    }

    return rest_ensure_response([
        'success'    => true,
        'token_type' => 'Bearer',
        'token'      => $session['token'],
        'expires_in' => $session['expires_in'],
        'user'       => nextjs_api_user_data($session['user']),
    ]);
}

/**
 * GET /auth/me
 */
function nextjs_auth_me(WP_REST_Request $request)
{
    $user = nextjs_api_current_user($request);

    if (!$user) {
        return nextjs_api_error(
            'not_authenticated',
            'Vui lòng đăng nhập lại.',
            401
        );
    }

    return rest_ensure_response([
        'success' => true,
        'user'    => nextjs_api_user_data($user),
    ]);
}

/**
 * POST /auth/logout
 */
function nextjs_auth_logout(WP_REST_Request $request)
{
    nextjs_api_revoke_session($request);

    return rest_ensure_response([
        'success' => true,
        'message' => 'Đã đăng xuất.',
    ]);
}