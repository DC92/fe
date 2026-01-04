<?php
// Bypass PWA cache
header('Content-type: text/javascript');
include 'service-worker.js';
echo PHP_EOL.'const date = '.time();