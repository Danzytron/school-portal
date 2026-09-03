<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\User::where('email', 'student@schoolportal.test')
    ->orWhere('name', 'Juan Dela Cruz')
    ->update(['name' => 'Roldan Jr. Delarmente']);

$user = \App\Models\User::where('email', 'student@schoolportal.test')->first();
echo "UPDATED_USER: " . ($user ? $user->name : "none") . "\n";
