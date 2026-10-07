<?php

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Site Info
 *
 * GET /wp-json/nextjs/v1/site
 */
add_action('rest_api_init', function () {

    register_rest_route('nextjs/v1', '/site', [
        'methods' => 'GET',

        'callback' => function () {

            return [
                'success' => true,

                'data' => [
                    'title' => get_bloginfo('name'),
                    'description' => get_bloginfo('description'),
                ],
            ];
        },

        'permission_callback' => '__return_true',
    ]);


    /**
     * Site Icon
     *
     * GET /wp-json/nextjs/v1/site/icon
     */
    register_rest_route('nextjs/v1', '/site/icon', [
        'methods' => 'GET',

        'callback' => function () {

            $site_icon_id = (int) get_option('site_icon');

            if (!$site_icon_id) {
                return [
                    'success' => true,
                    'data' => [
                        'id' => 0,
                        'url' => '',
                    ],
                ];
            }

            $icon_url = wp_get_attachment_image_url(
                $site_icon_id,
                'full'
            );

            return [
                'success' => true,
                'data' => [
                    'id' => $site_icon_id,
                    'url' => $icon_url ?: '',
                ],
            ];
        },

        'permission_callback' => '__return_true',
    ]);


    /**
     * Site Logo
     *
     * GET /wp-json/nextjs/v1/site/logo
     */
    register_rest_route('nextjs/v1', '/site/logo', [
        'methods' => 'GET',

        'callback' => function () {

            $custom_logo_id = (int) get_theme_mod(
                'custom_logo'
            );

            if (!$custom_logo_id) {
                return [
                    'success' => true,
                    'data' => [
                        'id' => 0,
                        'url' => '',
                        'alt' => '',
                        'width' => 0,
                        'height' => 0,
                    ],
                ];
            }

            $logo_url = wp_get_attachment_image_url(
                $custom_logo_id,
                'full'
            );

            $metadata = wp_get_attachment_metadata(
                $custom_logo_id
            );

            $alt = get_post_meta(
                $custom_logo_id,
                '_wp_attachment_image_alt',
                true
            );

            return [
                'success' => true,
                'data' => [
                    'id' => $custom_logo_id,
                    'url' => $logo_url ?: '',
                    'alt' => $alt ?: get_bloginfo('name'),
                    'width' => isset($metadata['width'])
                        ? (int) $metadata['width']
                        : 0,
                    'height' => isset($metadata['height'])
                        ? (int) $metadata['height']
                        : 0,
                ],
            ];
        },

        'permission_callback' => '__return_true',
    ]);

});