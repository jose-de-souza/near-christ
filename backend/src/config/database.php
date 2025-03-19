<?php

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$db_host = $_ENV['DB_HOST'] ?: getenv('DB_HOST');
$db_port = $_ENV['DB_PORT'] ?: getenv('DB_PORT');
$db_name = $_ENV['DB_NAME'] ?: getenv('DB_NAME');
$db_user = $_ENV['DB_USER'] ?: getenv('DB_USER');
$db_pass = $_ENV['DB_PASS'] ?: getenv('DB_PASS');

$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => $db_host,
    'port'      => $db_port,
    'database'  => $db_name,
    'username'  => $db_user,
    'password'  => $db_pass,
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => '',
]);

// IMPORTANT: make this Capsule instance available globally.
$capsule->setAsGlobal();
// Boot Eloquent ORM.
$capsule->bootEloquent();
