import { Head, Link } from '@inertiajs/react';

// Buat Layout Admin Sederhana (atau impor jika Anda punya)
// Untuk saat ini, kita buat layout sederhana di sini
function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <nav className="w-64 bg-gray-800 text-white p-5">
                <h2 className="text-xl font-bold mb-5">Admin Panel</h2>
                <ul>
                    <li className="mb-2">
                        <Link href={route('admin.dashboard')} className="hover:text-gray-300">Dashboard</Link>
                    </li>
                    <li className="mb-2">
                        <Link href={route('admin.perusahaan.index')} className="hover:text-gray-300">Kelola Perusahaan</Link>
                    </li>
                    <li className="mb-2">
                        <Link href={route('admin.users.index')} className="hover:text-gray-300">Kelola User</Link>
                    </li>
                    <li className="mt-10">
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button" 
                            className="w-full text-left hover:text-gray-300"
                        >
                            Logout
                        </Link>
                    </li>
                </ul>
            </nav>
            <main className="flex-1 p-10">
                {children}
            </main>
        </div>
    );
}


// Halaman Dashboard Admin
export default function Dashboard({ pendingCount, userCount, perusahaanCount }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Perusahaan Menunggu Persetujuan</h3>
                    <p className="text-4xl font-bold text-yellow-500 mt-2">{pendingCount}</p>
                    <Link href={route('admin.perusahaan.index')} className="text-blue-500 hover:underline mt-4 inline-block">
                        Lihat semua
                    </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Perusahaan</h3>
                    <p className="text-4xl font-bold text-blue-500 mt-2">{perusahaanCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Pengguna (Non-Admin)</h3>
                    <p className="text-4xl font-bold text-green-500 mt-2">{userCount}</p>
                    <Link href={route('admin.users.index')} className="text-blue-500 hover:underline mt-4 inline-block">
                        Lihat semua
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}