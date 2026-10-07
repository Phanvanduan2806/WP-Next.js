<?php
/**
 * Page template.
 *
 * @package NextJs
 */

get_header();
?>

<main id="main" class="site-main">

    <?php while (have_posts()) : the_post(); ?>

        <article id="post-<?php the_ID(); ?>" <?php post_class('page-content'); ?>>

            <header class="entry-header">
                <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
            </header>

            <div class="entry-content">
                <?php the_content(); ?>
            </div>

        </article>

    <?php endwhile; ?>

</main>

<?php get_footer(); ?>