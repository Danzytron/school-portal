<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userRole = strtolower(trim((string)$user->role));
        $normalizedRoles = array_map(function($r) {
            return strtolower(trim((string)$r));
        }, $roles);

        // Admins have universal authorization across modules, or if user's role is in allowed roles
        if ($userRole === 'admin' || $userRole === 'administrator' || in_array($userRole, $normalizedRoles)) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }
}
