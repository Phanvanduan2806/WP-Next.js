<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    /*
     * GET /category
     */
    register_rest_route('nextjs/v1', '/category', [
        'methods' => 'GET',

        'callback' => function () {

            $categories = get_categories([
                'hide_empty' => false,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]);

            $data = [];

            foreach ($categories as $category) {

                $image_id = (int) get_term_meta(
                    $category->term_id,
                    'category_image_id',
                    true
                );

                $content = get_term_meta(
                    $category->term_id,
                    'category_content',
                    true
                );

                $data[] = [
                    'id' => (int) $category->term_id,

                    'name' => $category->name,

                    'slug' => $category->slug,

                    'description' => $category->description,

                    'content' => $content,

                    'count' => (int) $category->count,

                    'parent' => (int) $category->parent,

                    'image' => [
                        'id' => $image_id,

                        'url' => $image_id
                            ? wp_get_attachment_image_url(
                                $image_id,
                                'full'
                            )
                            : null,
                    ],
                ];
            }

            return [
                'success' => true,
                'data' => $data,
            ];
        },

        'permission_callback' => '__return_true',
    ]);


    /*
     * GET /category/{slug}
     */
    register_rest_route(
        'nextjs/v1',
        '/category/(?P<slug>[a-zA-Z0-9-_]+)',
        [
            'methods' => 'GET',

            'callback' => function ($request) {

                $slug = sanitize_title(
                    $request->get_param('slug')
                );

                $category = get_category_by_slug($slug);

                if (
                    !$category ||
                    is_wp_error($category)
                ) {
                    return new WP_Error(
                        'category_not_found',
                        'Không tìm thấy category.',
                        [
                            'status' => 404,
                        ]
                    );
                }

                $image_id = (int) get_term_meta(
                    $category->term_id,
                    'category_image_id',
                    true
                );

                $content = get_term_meta(
                    $category->term_id,
                    'category_content',
                    true
                );

                return [
                    'success' => true,

                    'data' => [

                        'id' =>
                            (int) $category->term_id,

                        'name' =>
                            $category->name,

                        'slug' =>
                            $category->slug,

                        'description' =>
                            $category->description,

                        'content' =>
                            $content,

                        'count' =>
                            (int) $category->count,

                        'parent' =>
                            (int) $category->parent,

                        'image' => [

                            'id' =>
                                $image_id,

                            'url' => $image_id
                                ? wp_get_attachment_image_url(
                                    $image_id,
                                    'full'
                                )
                                : null,
                        ],
                    ],
                ];
            },

            'permission_callback' => '__return_true',
        ]
    );

});