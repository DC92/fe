<?php
// Bypass PWA cache
header('Content-type: text/html');
echo str_replace(
  'service-worker.js',
  'service-worker.js.php',
  file_get_contents('index.html')
);