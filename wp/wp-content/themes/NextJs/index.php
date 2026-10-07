<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

    <main style="max-width: 900px; margin: 80px auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1>Next.Js WP</h1>

        <p>
            WordPress is running as a Headless CMS.
        </p>

        <p>
            Frontend:
            <strong>Next.js</strong>
        </p>
    </main>

    <?php wp_footer(); ?>

</body>
</html>