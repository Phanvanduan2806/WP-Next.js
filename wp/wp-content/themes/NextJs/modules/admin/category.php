<?php

if (!defined('ABSPATH')) {
    exit;
}


/**
 * =========================================================
 * THÊM CATEGORY
 * =========================================================
 */
add_action('category_add_form_fields', function () {
    ?>

    <!-- Ảnh đại diện -->
    <div class="form-field">

        <label for="category_image_id">
            Ảnh đại diện
        </label>

        <input
            type="hidden"
            name="category_image_id"
            id="category_image_id"
            value=""
        >

        <div
            id="category-image-preview"
            style="margin-bottom: 10px;"
        ></div>

        <button
            type="button"
            class="button"
            id="category-image-upload"
        >
            Chọn ảnh
        </button>

        <button
            type="button"
            class="button"
            id="category-image-remove"
            style="display: none;"
        >
            Xóa ảnh
        </button>

    </div>


    <!-- Nội dung -->
    <div class="form-field">

        <label for="category_content">
            Nội dung
        </label>

        <?php

        wp_editor(
            '',
            'category_content',
            [
                'textarea_name' => 'category_content',
                'textarea_rows' => 15,
                'media_buttons' => true,
                'teeny'         => false,
            ]
        );

        ?>

    </div>

    <?php
});


/**
 * =========================================================
 * CHỈNH SỬA CATEGORY
 * =========================================================
 */
add_action(
    'category_edit_form_fields',
    function ($term) {

        $image_id = (int) get_term_meta(
            $term->term_id,
            'category_image_id',
            true
        );

        $content = get_term_meta(
            $term->term_id,
            'category_content',
            true
        );

        $image_url = $image_id
            ? wp_get_attachment_image_url(
                $image_id,
                'medium'
            )
            : '';

        ?>

        <!-- Ảnh đại diện -->
        <tr class="form-field">

            <th scope="row">
                <label for="category_image_id">
                    Ảnh đại diện
                </label>
            </th>

            <td>

                <input
                    type="hidden"
                    name="category_image_id"
                    id="category_image_id"
                    value="<?php echo esc_attr($image_id); ?>"
                >

                <div
                    id="category-image-preview"
                    style="margin-bottom: 10px;"
                >

                    <?php if ($image_url): ?>

                        <img
                            src="<?php echo esc_url($image_url); ?>"
                            alt=""
                            style="
                                max-width: 300px;
                                height: auto;
                                display: block;
                            "
                        >

                    <?php endif; ?>

                </div>

                <button
                    type="button"
                    class="button"
                    id="category-image-upload"
                >
                    Chọn ảnh
                </button>

                <button
                    type="button"
                    class="button"
                    id="category-image-remove"
                    <?php
                    echo $image_url
                        ? ''
                        : 'style="display: none;"';
                    ?>
                >
                    Xóa ảnh
                </button>

            </td>

        </tr>


        <!-- Nội dung -->
        <tr class="form-field">

            <th scope="row">
                <label for="category_content">
                    Nội dung
                </label>
            </th>

            <td>

                <?php

                wp_editor(
                    $content,
                    'category_content',
                    [
                        'textarea_name' => 'category_content',
                        'textarea_rows' => 15,
                        'media_buttons' => true,
                        'teeny'         => false,
                    ]
                );

                ?>

            </td>

        </tr>

        <?php
    }
);


/**
 * =========================================================
 * LƯU CATEGORY
 * =========================================================
 */
add_action(
    'created_category',
    'nextjs_save_category_fields'
);

add_action(
    'edited_category',
    'nextjs_save_category_fields'
);

function nextjs_save_category_fields($term_id)
{
    /**
     * Ảnh
     */
    if (isset($_POST['category_image_id'])) {

        $image_id = absint(
            $_POST['category_image_id']
        );

        if ($image_id) {

            update_term_meta(
                $term_id,
                'category_image_id',
                $image_id
            );

        } else {

            delete_term_meta(
                $term_id,
                'category_image_id'
            );
        }
    }


    /**
     * Nội dung
     */
    if (isset($_POST['category_content'])) {

        $content = wp_kses_post(
            wp_unslash(
                $_POST['category_content']
            )
        );

        update_term_meta(
            $term_id,
            'category_content',
            $content
        );

    } else {

        delete_term_meta(
            $term_id,
            'category_content'
        );
    }
};


/**
 * =========================================================
 * LOAD WORDPRESS MEDIA LIBRARY
 * =========================================================
 */
add_action(
    'admin_enqueue_scripts',
    function ($hook) {

        if (
            $hook !== 'edit-tags.php' &&
            $hook !== 'term.php'
        ) {
            return;
        }

        if (
            !isset($_GET['taxonomy']) ||
            $_GET['taxonomy'] !== 'category'
        ) {
            return;
        }

        wp_enqueue_media();

        wp_enqueue_script(
            'nextjs-category-admin',
            get_template_directory_uri()
                . '/modules/admin/category.js',
            ['jquery'],
            '1.0.0',
            true
        );
    }
);