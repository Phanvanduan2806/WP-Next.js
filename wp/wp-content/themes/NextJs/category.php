<?php

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main id="main" class="site-main">

    <header class="entry-header">
        <h1 class="entry-title">
            <?php single_cat_title(); ?>
        </h1>

        <?php if (category_description()) : ?>
            <div class="entry-content">
                <?php echo category_description(); ?>
            </div>
        <?php endif; ?>
    </header>

    <?php if (have_posts()) : ?>

        <div class="posts-list">

            <?php while (have_posts()) : the_post(); ?>

                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

                    <?php if (has_post_thumbnail()) : ?>

                        <a href="<?php the_permalink(); ?>" class="post-thumbnail">
                            <?php the_post_thumbnail('medium_large'); ?>
                        </a>

                    <?php endif; ?>

                    <header class="entry-header">
                        <?php the_title('<h2 class="entry-title"><a href="' . esc_url(get_permalink()) . '">', '</a></h2>'); ?>

                        <div class="entry-meta">
                            <time datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                                <?php echo esc_html(get_the_date()); ?>
                            </time>
                        </div>
                    </header>

                    <div class="entry-content">
                        <?php the_excerpt(); ?>
                    </div>

                </article>

            <?php endwhile; ?>

        </div>

        <?php the_posts_pagination(); ?>

    <?php else : ?>

        <p>Không có bài viết nào.</p>

    <?php endif; ?>

</main>

<?php get_footer(); ?>