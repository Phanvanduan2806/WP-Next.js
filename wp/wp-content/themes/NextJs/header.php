<?php

if (!defined('ABSPATH')) {
    exit;
}
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

<header class="site-header">

    <div class="site-header-inner">

        <div class="site-logo">

            <?php if (has_custom_logo()) : ?>

                <?php the_custom_logo(); ?>

            <?php else : ?>

                <a href="<?php echo esc_url(home_url('/')); ?>">
                    <?php bloginfo('name'); ?>
                </a>

            <?php endif; ?>

        </div>

        <nav
            class="site-navigation"
            aria-label="<?php esc_attr_e('Menu chính', 'nextjs'); ?>"
        >

            <?php
            wp_nav_menu([
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'primary-menu',
                'menu_id'        => 'primary-menu',
                'fallback_cb'    => false,
            ]);
            ?>

        </nav>

        <button
            class="site-menu-toggle"
            type="button"
            aria-label="Mở menu"
            aria-expanded="false"
        >
            <span></span>
            <span></span>
            <span></span>
        </button>

    </div>

</header>