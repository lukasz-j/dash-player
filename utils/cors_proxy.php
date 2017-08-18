<?php

include 'cors_proxy_config.php';

if (!(isset($_GET['url']) && parse_url($_GET['url']))) {
    header('HTTP/1.0 400 Bad Request');
    die('No/invalid URL provided');
}

$expectedAuth = sha1(AUTH_SECRET.$_GET['url']);

if (!(isset($_GET['auth']) && hash_equals($expectedAuth, $_GET['auth']))) {
    header('HTTP/1.0 403 Forbidden');
    die('No/invalid auth code');
}

define('USER_AGENT', 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko');

// allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Accept-Ranges: bytes');

$ch = curl_init($_GET['url']);
curl_setopt($ch, CURLOPT_USERAGENT, USER_AGENT);
if (isset($_SERVER['HTTP_RANGE'])) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Range: '.$_SERVER['HTTP_RANGE']]);
    header('HTTP/1.0 206 Partial Content');
}
curl_exec($ch);
