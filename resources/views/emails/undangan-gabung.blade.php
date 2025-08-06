<!DOCTYPE html>
<html>
<body>
    <h2>Undangan Bergabung ke Tim</h2>
    <p>Anda diundang sebagai <strong>{{ $role }}</strong>.</p>
    <a href="{{ url('/register?undangan=' . $undanganId) }}">Gabung Sekarang</a>
</body>
</html>
