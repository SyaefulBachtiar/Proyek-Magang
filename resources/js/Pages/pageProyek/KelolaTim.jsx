import Proyek from "../Proyek";
import { Head, router, usePage } from '@inertiajs/react';
import { ShieldCheck, ShieldAlert, User, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ====================================================================
// KOMPONEN BARU: UserAvatar
// Komponen kecil untuk menampilkan foto profil atau inisial nama
// ====================================================================
function UserAvatar({ src, name }) {
    // Ambil inisial dari nama, maks 2 huruf. '?' jika nama tidak ada.
    const initials = (name || '?')
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Asumsikan gambar disimpan di /storage/
    const avatarUrl = src ? `/storage/${src}` : null;

    return (
        <div className="flex-shrink-0">
            {avatarUrl ? (
                <img 
                    src={avatarUrl} 
                    alt={name} 
                    className="h-10 w-10 rounded-full object-cover" 
                    onError={(e) => e.target.style.display = 'none'} // Sembunyikan jika error
                />
            ) : (
                // Avatar default jika tidak ada gambar
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                    <span className="font-medium leading-none text-white">{initials}</span>
                </span>
            )}
        </div>
    );
}

// Komponen Badge Role (Sudah ada, sedikit disesuaikan)
const RoleBadge = ({ role }) => {
    const isKetua = role && role.toLowerCase() === 'ketua tim';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isKetua ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
            {isKetua ? <ShieldCheck className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
            {role || 'Member'}
        </span>
    );
};


// ====================================================================
// KOMPONEN UTAMA HALAMAN
// ====================================================================
export default function AnggotaTimPage({ dashboardId, activePage, tim, anggota_list, currentAuth, filters }) {
    
    const { errors } = usePage().props.flash || {};
    const [search, setSearch] = useState(filters.search || '');
    const debounceTimeout = useRef(null);

    // Efek untuk pencarian (debouncing) - Tidak berubah
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            router.get(
                route('proyek.kelolatim', { id: dashboardId, id_tim: tim.id }),
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [search, dashboardId, tim.id]);

    // Handler untuk ganti role - Tidak berubah
    const handleRoleChange = (anggotaTimId, newRole) => {
        router.post(
            route('proyek.kelolatim.updateRole', { id: dashboardId, id_tim: tim.id }),
            { anggota_tim_id: anggotaTimId, new_role: newRole },
            { preserveScroll: true }
        );
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head title="Anggota Tim" />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Header Halaman */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Anggota Tim</h1>
                        <p className="text-gray-600 mt-1">Kelola semua anggota yang tergabung dalam tim "{tim.nama_tim}".</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan nama..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Notifikasi Alert Error */}
                    {errors?.message && (
                        <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700">
                            {errors.message}
                        </div>
                    )}
                   
                    {/* ==================================================== */}
                    {/* AREA KONTEN BARU: Struktur List Modern */}
                    {/* ==================================================== */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Header List (Hanya tampil di layar medium ke atas) */}
                        <div className="hidden md:flex px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="w-full md:w-3/5 text-xs font-medium text-gray-500 uppercase tracking-wider">Anggota</div>
                            <div className="w-full md:w-1/5 text-xs font-medium text-gray-500 uppercase tracking-wider">Role Tim</div>
                            <div className="w-full md:w-1/5 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</div>
                        </div>

                        {/* Body List */}
                        <div className="divide-y divide-gray-200">
                            {anggota_list.length > 0 ? (
                                anggota_list.map((anggota) => {
                                    
                                    // Logika Perizinan (Tidak berubah)
                                    const isCurrentUser = anggota.id_users === currentAuth.id;
                                    const isUneditable = (
                                        anggota.role_anggota && anggota.role_anggota.toLowerCase() === 'ketua tim' && 
                                        anggota.user_company_role && anggota.user_company_role.toLowerCase() === 'super user'
                                    );
                                    const isSelectDisabled = !currentAuth.canEdit || isCurrentUser || isUneditable;

                                    return (
                                        // Setiap item adalah flex container, responsif (flex-col md:flex-row)
                                        <div key={anggota.id} className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 hover:bg-gray-50">
                                            
                                            {/* Bagian 1: Info User (Avatar, Nama, Email) */}
                                            <div className="w-full md:w-3/5 flex items-center mb-4 md:mb-0">
                                                <UserAvatar src={anggota.user.poto_profile_user} name={anggota.user.name} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {anggota.user.name}
                                                        {isCurrentUser && <span className="ml-2 text-xs text-blue-500">(Anda)</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{anggota.user.email}</div>
                                                </div>
                                            </div>

                                            {/* Bagian 2: Role Tim */}
                                            <div className="w-full md:w-1/5 mb-4 md:mb-0">
                                                {/* Label untuk mobile */}
                                                <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Role Tim: </span>
                                                <RoleBadge role={anggota.role_anggota} />
                                                {isUneditable && (
                                                    <ShieldAlert className="inline ml-2 h-4 w-4 text-yellow-500" titleAccess="Super User - Role tidak dapat diubah" />
                                                )}
                                            </div>

                                            {/* Bagian 3: Aksi (Dropdown) */}
                                            <div className="w-full md:w-1/5">
                                                {/* Label untuk mobile */}
                                                <span className="md:hidden text-xs font-medium text-gray-500 uppercase mr-2">Ubah Role: </span>
                                                <select
                                                    value={anggota.role_anggota || 'Member'}
                                                    onChange={(e) => handleRoleChange(anggota.id, e.target.value)}
                                                    disabled={isSelectDisabled}
                                                    className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                                                        isSelectDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    <option value="Member">Member</option>
                                                    <option value="Ketua Tim">Ketua Tim</option>
                                                </select>
                                            </div>

                                        </div>
                                    );
                                })
                            ) : (
                                // Pesan jika tidak ada anggota
                                <div className="px-6 py-10 text-center text-gray-500">
                                    Tidak ada anggota yang ditemukan.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}