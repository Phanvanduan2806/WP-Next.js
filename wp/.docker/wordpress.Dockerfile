FROM wordpress

COPY ./php-custom.ini $PHP_INI_DIR/conf.d/
#COPY wp-inital-plugins /usr/src/wordpress/wp-content/plugins
#COPY wp-inital-themes /usr/src/wordpress/wp-content/themes