<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

#### Pastikan versi php di atas 8.2.0
### 1. Clone Repository
```bash
git clone https://github.com/username/laravel-breeze-react.git
cd laravel-breeze-react
```
### 2. Install Dependency Laravel
```bash
composer install
```
### 3. Install Dependency React
```bash
npm install
```
### 4. Copy dan Setup Environment File
```bash
cp .env.example .env
```

## Buat Database di phpmyadmin, lalu atur konfigurasi database di file .env:
```bash
DB_DATABASE=bbpk_ciloto
DB_USERNAME=root
DB_PASSWORD=<password database kamu>
```

### 5. Generate App Key
```bash
php artisan key:generate
```
### 6. Migrasi Database
```bash
php artisan migrate
```
### 7. Jalankan Vite dan Laravel
## Terminal 1 jalankan Laravel
```bash
php artisan serve
```
## Terminal 2 jalankan react js
```bash
npm run dev
```

### 8. Jalankan Seeder
```bash
php artisan db:seed
```


