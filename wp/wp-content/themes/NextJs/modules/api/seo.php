<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    register_rest_route('nextjs/v1', '/seo', [
        'methods' => 'GET',

        'callback' => function ($request) {

            /*
             * Rank Math phải được kích hoạt.
             */
            if (
                !defined('RANK_MATH_VERSION') ||
                !function_exists('rank_math')
            ) {
                return new WP_Error(
                    'rank_math_not_available',
                    'Rank Math chưa được kích hoạt.',
                    [
                        'status' => 500,
                    ]
                );
            }

            /*
             * Lấy URL.
             *
             * Ví dụ:
             * /about/
             *
             * hoặc:
             * http://localhost:3010/about/
             */
            $url = $request->get_param('url');

            if (!$url) {
                return new WP_Error(
                    'missing_url',
                    'Thiếu tham số url.',
                    [
                        'status' => 400,
                    ]
                );
            }

            $url = esc_url_raw($url);

            if (!$url) {
                return new WP_Error(
                    'invalid_url',
                    'URL không hợp lệ.',
                    [
                        'status' => 400,
                    ]
                );
            }

            /*
             * Nếu truyền relative URL:
             *
             * /about/
             *
             * chuyển thành:
             *
             * http://localhost:3010/about/
             */
            if (str_starts_with($url, '/')) {
                $url = home_url($url);
            }

            /*
             * Chỉ cho phép URL thuộc WordPress site.
             */
            $site_host = wp_parse_url(
                home_url(),
                PHP_URL_HOST
            );

            $request_host = wp_parse_url(
                $url,
                PHP_URL_HOST
            );

            if (
                !$site_host ||
                !$request_host ||
                strtolower($site_host) !== strtolower($request_host)
            ) {
                return new WP_Error(
                    'invalid_url',
                    'URL phải thuộc website WordPress hiện tại.',
                    [
                        'status' => 400,
                    ]
                );
            }

            /*
             * =========================================================
             * 1. Chuẩn bị WordPress query giống Rank Math Headless API
             * =========================================================
             */

            $rank_math_headless =
                new \RankMath\Rest\Headless();

            /*
             * Rank Math generate request URI.
             */
            $request_uri =
                $rank_math_headless->generate_request_uri(
                    $url
                );

            /*
             * Lưu REQUEST_URI cũ để tránh ảnh hưởng
             * request hiện tại.
             */
            $old_request_uri =
                $_SERVER['REQUEST_URI'] ?? null;

            $_SERVER['REQUEST_URI'] =
                $request_uri;

            /*
             * Rank Math Headless API remove các action này
             * trước khi chạy wp().
             */
            remove_all_actions('wp');

            remove_all_actions(
                'parse_request'
            );

            /*
             * Rebuild WordPress query.
             */
            wp();

            /*
             * Homepage.
             */
            if ($rank_math_headless->is_home) {
                $GLOBALS['wp_query']->is_home = true;
            }

            /*
             * Setup Rank Math variables + modules.
             */
            rank_math()->variables->setup();

            rank_math()->manager->load_modules();

            /*
             * Khởi tạo Rank Math frontend.
             */
            new \RankMath\Frontend\Frontend();

            /*
             * =========================================================
             * 2. Generate Rank Math head
             * =========================================================
             */

            ob_start();

            do_action('wp');

            do_action('rank_math/head');

            $head = ob_get_clean();

            /*
             * Restore REQUEST_URI.
             */
            if ($old_request_uri !== null) {
                $_SERVER['REQUEST_URI'] =
                    $old_request_uri;
            } else {
                unset($_SERVER['REQUEST_URI']);
            }

            /*
             * =========================================================
             * 3. Parse HTML
             * =========================================================
             */

            libxml_use_internal_errors(true);

            $dom = new DOMDocument();

            $dom->loadHTML(
                '<?xml encoding="utf-8" ?>' .
                $head
            );

            libxml_clear_errors();

            $xpath = new DOMXPath($dom);

            /*
             * Helper lấy meta.
             */
            $get_meta = function (
                string $attribute,
                string $value
            ) use ($xpath) {

                $nodes = $xpath->query(
                    "//meta[@{$attribute}='{$value}']"
                );

                if (
                    !$nodes ||
                    $nodes->length === 0
                ) {
                    return null;
                }

                return $nodes
                    ->item(0)
                    ->getAttribute('content');
            };

            /*
             * =========================================================
             * Title
             * =========================================================
             */

            $title = null;

            $title_nodes =
                $xpath->query('//title');

            if (
                $title_nodes &&
                $title_nodes->length > 0
            ) {
                $title = trim(
                    $title_nodes
                        ->item(0)
                        ->textContent
                );
            }

            /*
             * =========================================================
             * Canonical
             * =========================================================
             */

            $canonical = null;

            $canonical_nodes =
                $xpath->query(
                    "//link[@rel='canonical']"
                );

            if (
                $canonical_nodes &&
                $canonical_nodes->length > 0
            ) {
                $canonical =
                    $canonical_nodes
                        ->item(0)
                        ->getAttribute('href');
            }

            /*
             * =========================================================
             * OpenGraph
             * =========================================================
             */

            $open_graph = [
                'locale' => $get_meta(
                    'property',
                    'og:locale'
                ),

                'type' => $get_meta(
                    'property',
                    'og:type'
                ),

                'title' => $get_meta(
                    'property',
                    'og:title'
                ),

                'description' => $get_meta(
                    'property',
                    'og:description'
                ),

                'url' => $get_meta(
                    'property',
                    'og:url'
                ),

                'siteName' => $get_meta(
                    'property',
                    'og:site_name'
                ),

                'image' => $get_meta(
                    'property',
                    'og:image'
                ),

                'updatedTime' => $get_meta(
                    'property',
                    'og:updated_time'
                ),

                'publishedTime' => $get_meta(
                    'property',
                    'article:published_time'
                ),

                'modifiedTime' => $get_meta(
                    'property',
                    'article:modified_time'
                ),
            ];

            /*
             * =========================================================
             * Twitter
             * =========================================================
             */

            $twitter = [
                'card' => $get_meta(
                    'name',
                    'twitter:card'
                ),

                'title' => $get_meta(
                    'name',
                    'twitter:title'
                ),

                'description' => $get_meta(
                    'name',
                    'twitter:description'
                ),

                'image' => $get_meta(
                    'name',
                    'twitter:image'
                ),
            ];

            /*
             * =========================================================
             * JSON-LD Schema
             * =========================================================
             */

            $schema = [];

            $schema_nodes =
                $xpath->query(
                    "//script[@type='application/ld+json']"
                );

            if ($schema_nodes) {

                foreach ($schema_nodes as $node) {

                    $json = trim(
                        $node->textContent
                    );

                    if (!$json) {
                        continue;
                    }

                    $decoded =
                        json_decode(
                            $json,
                            true
                        );

                    if (
                        json_last_error() ===
                        JSON_ERROR_NONE
                    ) {
                        $schema[] = $decoded;
                    }
                }
            }

            /*
             * =========================================================
             * Trả JSON
             * =========================================================
             */

            return [
                'success' => true,

                'data' => [

                    'title' => $title,

                    'description' =>
                        $get_meta(
                            'name',
                            'description'
                        ),

                    'robots' =>
                        $get_meta(
                            'name',
                            'robots'
                        ),

                    'canonical' => $canonical,

                    'openGraph' =>
                        $open_graph,

                    'twitter' =>
                        $twitter,

                    'schema' =>
                        $schema,
                ],
            ];
        },

        'permission_callback' => '__return_true',
    ]);

});