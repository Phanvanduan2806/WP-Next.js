<?php

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Posts
 *
 * GET /wp-json/nextjs/v1/posts
 * GET /wp-json/nextjs/v1/posts/{slug}
 */
add_action('rest_api_init', function () {

    /**
     * Get Posts
     */
    register_rest_route('nextjs/v1', '/posts', [
        'methods' => 'GET',

        'callback' => function ($request) {

            $page = max(
                1,
                (int) $request->get_param('page')
            );

            $per_page = min(
                100,
                max(
                    1,
                    (int) $request->get_param('per_page')
                )
            );

            $query = new WP_Query([
                'post_type'      => 'post',
                'post_status'    => 'publish',
                'posts_per_page' => $per_page,
                'paged'          => $page,
                'orderby'        => 'date',
                'order'          => 'DESC',
            ]);

            $posts = [];

            foreach ($query->posts as $post) {

                $featured_image = '';

                if (has_post_thumbnail($post->ID)) {
                    $featured_image = get_the_post_thumbnail_url(
                        $post->ID,
                        'full'
                    );
                }

                $categories = [];

                $terms = get_the_category($post->ID);

                foreach ($terms as $term) {
                    $categories[] = [
                        'id'   => (int) $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                    ];
                }

                $posts[] = [
                    'id' => (int) $post->ID,

                    'title' => get_the_title($post->ID),

                    'slug' => $post->post_name,

                    'content' => apply_filters(
                        'the_content',
                        $post->post_content
                    ),

                    'excerpt' => get_the_excerpt(
                        $post->ID
                    ),

                    'date' => get_the_date(
                        'c',
                        $post->ID
                    ),

                    'modified' => get_the_modified_date(
                        'c',
                        $post->ID
                    ),

                    'status' => $post->post_status,

                    'author' => [
                        'id' => (int) $post->post_author,
                        'name' => get_the_author_meta(
                            'display_name',
                            $post->post_author
                        ),
                    ],

                    'featured_image' => $featured_image,

                    'categories' => $categories,
                ];
            }

            return [
                'success' => true,

                'data' => $posts,

                'pagination' => [
                    'page' => $page,
                    'per_page' => $per_page,
                    'total' => (int) $query->found_posts,
                    'total_pages' => (int) $query->max_num_pages,
                ],
            ];
        },

        'permission_callback' => '__return_true',
    ]);


    /**
     * Get Post By Slug
     */
    register_rest_route('nextjs/v1', '/posts/(?P<slug>[a-zA-Z0-9-_]+)', [
        'methods' => 'GET',

        'callback' => function ($request) {

            $slug = sanitize_title(
                $request->get_param('slug')
            );

            $query = new WP_Query([
                'post_type'      => 'post',
                'post_status'    => 'publish',
                'name'           => $slug,
                'posts_per_page' => 1,
            ]);

            if (!$query->have_posts()) {
                return new WP_Error(
                    'post_not_found',
                    'Không tìm thấy bài viết.',
                    [
                        'status' => 404,
                    ]
                );
            }

            $post = $query->posts[0];

            $featured_image = '';

            if (has_post_thumbnail($post->ID)) {
                $featured_image = get_the_post_thumbnail_url(
                    $post->ID,
                    'full'
                );
            }

            $categories = [];

            $terms = get_the_category($post->ID);

            foreach ($terms as $term) {
                $categories[] = [
                    'id'   => (int) $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                ];
            }

            return [
                'success' => true,

                'data' => [
                    'id' => (int) $post->ID,

                    'title' => get_the_title(
                        $post->ID
                    ),

                    'slug' => $post->post_name,

                    'content' => apply_filters(
                        'the_content',
                        $post->post_content
                    ),

                    'excerpt' => get_the_excerpt(
                        $post->ID
                    ),

                    'date' => get_the_date(
                        'c',
                        $post->ID
                    ),

                    'modified' => get_the_modified_date(
                        'c',
                        $post->ID
                    ),

                    'status' => $post->post_status,

                    'author' => [
                        'id' => (int) $post->post_author,

                        'name' => get_the_author_meta(
                            'display_name',
                            $post->post_author
                        ),
                    ],

                    'featured_image' => $featured_image,

                    'categories' => $categories,
                ],
            ];
        },

        'permission_callback' => '__return_true',
    ]);

});