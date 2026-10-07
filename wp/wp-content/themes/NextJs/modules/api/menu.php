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

                $parent = (int) $item->menu_item_parent;

                $depth = 0;

                if ($parent > 0) {
                    $depth = 1;

                    $current_parent = $parent;

                    while ($current_parent > 0) {

                        $parent_item = null;

                        foreach ($items as $menu_item) {

                            if (
                                (int) $menu_item->ID === $current_parent
                            ) {
                                $parent_item = $menu_item;
                                break;
                            }

                        }

                        if (!$parent_item) {
                            break;
                        }

                        $current_parent = (int) $parent_item->menu_item_parent;

                        if ($current_parent > 0) {
                            $depth++;
                        }
                    }
                }

                /**
                 * Icon lưu trong menu item meta.
                 */
                $icon = get_post_meta(
                    $item->ID,
                    '_menu_item_icon',
                    true
                );

                $data[] = [
                    'id' => (int) $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'icon' => $icon ?: null,
                    'parent' => $parent,
                    'depth' => $depth,
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