import { Head, Link, usePage } from '@inertiajs/react';

// --- Layout Admin (Sama seperti di Dashboard.jsx) ---
// (Idealnya, ini akan menjadi file tersendiri di resources/js/Layouts/AdminLayout.jsx)
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
export default function ManagePerusahaan() {
    const { perusahaanList, flash } = usePage().props;

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Perusahaan" />

            <h1 className="text-3xl font-bold mb-6">Kelola Perusahaan</h1>

            {/* Tampilkan flash message jika ada */}
            {flash.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                    <p>{flash.success}</p>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perusahaan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemilik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {perusahaanList.data.map((perusahaan) => (
                            <tr key={perusahaan.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{perusahaan.nama_perusahaan || "-"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{perusahaan.user.name}</div>
                                    <div className="text-xs text-gray-400">{perusahaan.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(perusahaan.status)}`}>
                                        {perusahaan.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right flex justify-end gap-2">
                                    {perusahaan.status === 'pending' && (
                                        <>
                                            <Link
                                                href={route('admin.perusahaan.approve', perusahaan.id)}
                                                method="put"
                                                as="button"
                                                className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
                                            >
                                                Approve
                                            </Link>
                                            <Link
                                                href={route('admin.perusahaan.reject', perusahaan.id)}
                                                method="put"
                                                as="button"
                                                className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-xs"
                                            >
                                                Reject
                                            </Link>
                                        </>
                                    )}
                                    <Link
                                        href={route('admin.perusahaan.destroy', perusahaan.id)}
                                        method="delete"
                                        as="button"
                                        onBefore={() => window.confirm('Anda yakin ingin menghapus perusahaan ini secara permanen? Semua data tim dan proyek di dalamnya akan hilang.')}
                                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                                    >
                                        Delete
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={perusahaanList.links} />
        </AdminLayout>
    );
}