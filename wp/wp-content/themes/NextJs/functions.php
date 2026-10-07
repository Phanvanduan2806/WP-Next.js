<?php

if (!defined('ABSPATH')) {
    exit;
}

require_once get_template_directory() . '/modules/index.php';

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