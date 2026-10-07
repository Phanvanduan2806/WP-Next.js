<?php

if (!defined('ABSPATH')) {
    exit;
}

require_once get_template_directory() . '/modules/index.php';


/**
 * Theme setup.
 */
function nextjs_theme_setup() {

    add_theme_support('title-tag');

    add_theme_support('post-thumbnails');

    add_theme_support('custom-logo', [
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ]);

    add_theme_support('html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ]);

    register_nav_menus([
        'primary' => 'Menu chính',
    ]);
}

add_action('after_setup_theme', 'nextjs_theme_setup');


/**
 * Enqueue theme assets.
 */
function nextjs_enqueue_assets() {

    $style_path = get_template_directory() . '/css/style.css';

    wp_enqueue_style(
        'nextjs-style',
        get_template_directory_uri() . '/css/style.css',
        [],
        file_exists($style_path) ? filemtime($style_path) : null
    );
}

add_action('wp_enqueue_scripts', 'nextjs_enqueue_assets');


/**
 * Add icon field to menu item.
 */
function nextjs_menu_item_icon_field($item_id, $item, $depth, $args) {

    $icon = get_post_meta(
        $item_id,
        '_menu_item_icon',
        true
    );
    ?>

    <p class="description description-wide">

        <label for="edit-menu-item-icon-<?php echo esc_attr($item_id); ?>">

            <?php esc_html_e('Icon', 'nextjs'); ?>

            <br>

            <input
                type="text"
                id="edit-menu-item-icon-<?php echo esc_attr($item_id); ?>"
                class="widefat code"
                name="menu-item-icon[<?php echo esc_attr($item_id); ?>]"
                value="<?php echo esc_attr($icon); ?>"
                placeholder="Ví dụ: home"
            >

            <span class="description">
                Nhập tên hoặc class icon.
            </span>

        </label>

    </p>

    <?php
}

add_action(
    'wp_nav_menu_item_custom_fields',
    'nextjs_menu_item_icon_field',
    10,
    4
);


/**
 * Save menu item icon.
 */
function nextjs_save_menu_item_icon($menu_id, $menu_item_db_id) {

    if (
        isset($_POST['menu-item-icon']) &&
        isset($_POST['menu-item-icon'][$menu_item_db_id])
    ) {

        $icon = sanitize_text_field(
            wp_unslash(
                $_POST['menu-item-icon'][$menu_item_db_id]
            )
        );

        update_post_meta(
            $menu_item_db_id,
            '_menu_item_icon',
            $icon
        );

    } else {

        delete_post_meta(
            $menu_item_db_id,
            '_menu_item_icon'
        );
    }
}

add_action(
    'wp_update_nav_menu_item',
    'nextjs_save_menu_item_icon',
    10,
    2
);