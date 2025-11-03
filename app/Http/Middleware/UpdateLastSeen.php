<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class UpdateLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $cacheKey = 'last_seen_at_' . $user->id;

            // Hanya update database jika cache sudah expired (setiap 1 menit)
            if (!Cache::has($cacheKey)) {
                User::where('id', $user->id)->update(['last_seen' => now()]);

                // Set cache agar tidak update lagi selama 1 menit ke depan
                Cache::put($cacheKey, true, now()->addMinute());
            }
        }

        return $next($request);
    }
}