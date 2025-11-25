<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // 1. JIKA DI LOCALHOST: Jangan pasang aturan CSP apa pun (Bebaskan saja)
        // Ini akan menghilangkan semua error merah di console saat development
        if (app()->environment('local', 'testing')) {
            return $response;
        }

        // =================================================================
        // 2. JIKA DI VPS / PRODUCTION: Baru pasang aturan ketat
        // =================================================================
        
        // Ganti ini dengan domain VPS Anda nanti saat sudah upload
        $productionWebsocket = "wss://sipantas.bbpkciloto.or.id:8080"; 

        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
               "style-src 'self' 'unsafe-inline' https://fonts.bunny.net; " .
               "font-src 'self' https://fonts.bunny.net; " .
               "connect-src 'self' " . $productionWebsocket . "; " .
               "img-src 'self' data: https: blob:;";

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}