import { Head, Link, usePage } from '@inertiajs/react';

// --- Layout Admin (Sama seperti di Dashboard.jsx) ---
function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <nav className="w-64 bg-gray-800 text-white p-5 flex-shrink-0">
                <h2 className="text-xl font-bold mb-5">Admin Panel</h2>
                <ul>
                    <li className="mb-2">
                        <Link href={route('admin.dashboard')} className={`hover:text-gray-300 ${route().current('admin.dashboard') ? 'font-bold' : ''}`}>Dashboard</Link>
                    </li>
                    <li className="mb-2">
                        <Link href={route('admin.perusahaan.index')} className={`hover:text-gray-300 ${route().current('admin.perusahaan.index') ? 'font-bold' : ''}`}>Kelola Perusahaan</Link>
                    </li>
                    <li className="mb-2">
                        <Link href={route('admin.users.index')} className={`hover:text-gray-300 ${route().current('admin.users.index') ? 'font-bold' : ''}`}>Kelola User</Link>
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
            <main className="flex-1 p-10 overflow-x-auto">
                {children}
            </main>
        </div>
    );
}

// --- Komponen Pagination Sederhana ---
function Pagination({ links }) {
    return (
        <div className="mt-6 flex justify-center">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-4 py-2 mx-1 rounded ${
                        link.active ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                    } ${!link.url ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    as="button"
                    disabled={!link.url}
                />
            ))}
        </div>
    );
}

// --- Halaman Utama ---
export default function ManageUsers() {
    const { userList } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Kelola Pengguna" />

            <h1 className="text-3xl font-bold mb-6">Kelola Pengguna (Non-Admin)</h1>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pengguna</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {userList.data.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.perusahaan?.nama_perusahaan || "Belum ada"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <button
                                        disabled
                                        className="text-white bg-gray-400 px-3 py-1 rounded text-xs cursor-not-allowed"
                                    >
                                        (future action)
                                    </button>
                                    {/* Di sini Anda bisa menambahkan tombol 'Edit' atau 'Deactivate' nanti */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={userList.links} />
        </AdminLayout>
    );
}