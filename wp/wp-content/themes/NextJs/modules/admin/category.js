jQuery(function ($) {

    let mediaFrame = null;

    $("#category-image-upload").on(
        "click",
        function (event) {

            event.preventDefault();

            if (mediaFrame) {
                mediaFrame.open();
                return;
            }

            mediaFrame = wp.media({
                title: "Chọn ảnh đại diện",
                button: {
                    text: "Đặt ảnh đại diện"
                },
                multiple: false
            });

            mediaFrame.on(
                "select",
                function () {

                    const attachment =
                        mediaFrame
                            .state()
                            .get("selection")
                            .first()
                            .toJSON();

                    $("#category_image_id")
                        .val(attachment.id);

                    $("#category-image-preview")
                        .html(
                            `<img
                                src="${attachment.url}"
                                alt=""
                                style="
                                    max-width: 300px;
                                    height: auto;
                                    display: block;
                                "
                            >`
                        );

                    $("#category-image-remove")
                        .show();
                }
            );

            mediaFrame.open();
        }
    );


    $("#category-image-remove").on(
        "click",
        function (event) {

            event.preventDefault();

            $("#category_image_id")
                .val("");

            $("#category-image-preview")
                .empty();

            $(this).hide();
        }
    );

});