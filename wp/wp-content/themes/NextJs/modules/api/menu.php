<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    register_rest_route('nextjs/v1', '/menu', [
        'methods' => 'GET',

        'callback' => function () {

            $locations = get_nav_menu_locations();

            if (empty($locations['primary'])) {
                return [
                    'success' => false,
                    'message' => 'Menu primary chưa được cấu hình.',
                    'data' => [],
                ];
            }

            $items = wp_get_nav_menu_items(
                $locations['primary']
            );

            if (!$items) {
                return [
                    'success' => true,
                    'data' => [],
                ];
            }

            $data = [];

            foreach ($items as $item) {
                $data[] = [
                    'id' => (int) $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'parent' => (int) $item->menu_item_parent,
                    'order' => (int) $item->menu_order,
                ];
            }

            return [
                'success' => true,
                'data' => $data,
            ];
        },

        'permission_callback' => '__return_true',
    ]);

});