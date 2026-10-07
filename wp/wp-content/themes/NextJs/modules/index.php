<?php

if (!defined('ABSPATH')) {
    exit;
}

$module_directories = [
    __DIR__ . '/admin',
    __DIR__ . '/api',
];

foreach ($module_directories as $directory) {

    if (!is_dir($directory)) {
        continue;
    }

    $files = glob($directory . '/*.php');

    if (!$files) {
        continue;
    }

    foreach ($files as $file) {

        require_once $file;
    }
}