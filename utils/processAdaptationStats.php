<?php

if (php_sapi_name() != 'cli') {
    die("CLI only\n");
}

if ($argc < 2 || !file_exists($argv[1])) {
    die("File not specified/not exists\n");
}

$data = json_decode(file_get_contents($argv[1]), true);
if (!$data) {
    die("Invalid file specified\n");
}

$callbacks = [
    'videoSegmentComplete' => function($key, $time, $event, &$outputs) {
        $outputs['videoRepresentation'][] = [$time, $event['representation']];
        $outputs['buffer'][] = [$time, $event['buffer']];
        $outputs['throughput'][] = [$time, $event['throughput'] / 1024.0];
    },
    'audioSegmentComplete' => function($key, $time, $event, &$outputs) {
        $outputs['audioRepresentation'][] = [$time, $event['representation']];
    },
];

$outputs = [];
foreach ($data as $key => $keyData) {
    if (!isset($outputs[$key])) {
        $outputs[$key] = [];
    }
    foreach ($keyData as list($time, $event)) {
        if (isset($callbacks[$key])) {
            $callbacks[$key]($key, $time, $event, $outputs);
        }
        else {
            $outputs[$key][] = [$time, floatval($event)];
        }
    }
}
foreach ($outputs as $key => $data) {
    if (empty($data)) {
        continue;
    }
    $f = fopen("$key.dat", "w");
    foreach ($data as list($time, $val)) {
        fwrite($f, "$time\t$val\n");
    }
    fclose($f);
}
