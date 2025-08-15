<!DOCTYPE html>
<html>
<body>
    <h2>Undangan Bergabung ke Tim</h2>
    <p>Anda diundang untuk bergabung sebagai <strong>{{ $role }}</strong>.</p>
    
    {{-- Gunakan variabel URL yang sudah jadi --}}
    <a href="{{ $undanganId }}">Gabung Sekarang</a>
    
    <p>Link ini akan kedaluwarsa dalam 7 hari.</p>
    <p>Jika tombol tidak berfungsi, salin dan tempel URL berikut di browser Anda:</p>
    <p>{{ $undanganId }}</p>
</body>
</html>
