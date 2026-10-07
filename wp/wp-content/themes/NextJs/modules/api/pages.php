<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    /**
     * GET /wp-json/nextjs/v1/pages
     */
    register_rest_route('nextjs/v1', '/pages', [
        'methods' => 'GET',

        'callback' => function () {

            $pages = get_pages([
                'post_status' => 'publish',
                'sort_column' => 'menu_order',
                'sort_order' => 'ASC',
            ]);

            $data = [];

            foreach ($pages as $page) {
                $data[] = [
                    'id' => (int) $page->ID,
                    'title' => get_the_title($page->ID),
                    'slug' => $page->post_name,
                    'content' => apply_filters(
                        'the_content',
                        $page->post_content
                    ),
                    'excerpt' => get_the_excerpt($page->ID),
                    'date' => $page->post_date,
                    'modified' => $page->post_modified,
                    'parent' => (int) $page->post_parent,
                    'order' => (int) $page->menu_order,
                ];
            }

            return [
                'success' => true,
                'data' => $data,
            ];
        },

        'permission_callback' => '__return_true',
    ]);

    /**
     * GET /wp-json/nextjs/v1/pages/{slug}
     */
    register_rest_route(
        'nextjs/v1',
        '/pages/(?P<slug>[a-zA-Z0-9-_]+)',
        [
            'methods' => 'GET',

            'callback' => function ($request) {

                $slug = sanitize_title(
                    $request->get_param('slug')
                );

                $page = get_page_by_path($slug);

                if (!$page || $page->post_status !== 'publish') {
                    return new WP_Error(
                        'page_not_found',
                        'Không tìm thấy trang.',
                        [
                            'status' => 404,
                        ]
                    );
                }

                return [
                    'success' => true,
                    'data' => [
                        'id' => (int) $page->ID,
                        'title' => get_the_title($page->ID),
                        'slug' => $page->post_name,
                        'content' => apply_filters(
                            'the_content',
                            $page->post_content
                        ),
                        'excerpt' => get_the_excerpt($page->ID),
                        'date' => $page->post_date,
                        'modified' => $page->post_modified,
                        'status' => $page->post_status,
                        'parent' => (int) $page->post_parent,
                        'order' => (int) $page->menu_order,
                    ],
                ];
            },

            'permission_callback' => '__return_true',
        ]
    );

});