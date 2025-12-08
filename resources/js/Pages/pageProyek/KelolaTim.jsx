import Proyek from "../Proyek";
import { Head, router, usePage } from '@inertiajs/react';
import { ShieldCheck, ShieldAlert, User, Search, MoreVertical } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Komponen Avatar dengan style modern (sedikit ring dan shadow)
function UserAvatar({ src, name }) {
    const initials = (name || '?')
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const avatarUrl = src ? `/storage/${src}` : null;

    return (
        <div className="flex-shrink-0 relative">
            {avatarUrl ? (
                <img 
                    src={avatarUrl} 
                    alt={name} 
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm" 
                    onError={(e) => e.target.style.display = 'none'} 
                />
            ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm ring-2 ring-white">
                    <span className="font-semibold leading-none text-white text-sm">{initials}</span>
                </span>
            )}
        </div>
    );
}

// Badge Role dengan warna pastel modern
const RoleBadge = ({ role }) => {
    const isKetua = role && role.toLowerCase() === 'ketua tim';
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
            isKetua 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
            {isKetua ? <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> : <User className="mr-1.5 h-3.5 w-3.5" />}
            {role || 'Member'}
        </span>
    );
};

export default function AnggotaTimPage({ dashboardId, activePage, tim, anggota_list, currentAuth, filters }) {
    
    // --- LOGIKA TIDAK DIUBAH (Start) ---
    const { errors } = usePage().props.flash || {};
    const [search, setSearch] = useState(filters.search || '');
    const debounceTimeout = useRef(null);

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

    const handleRoleChange = (anggotaTimId, newRole) => {
        router.post(
            route('proyek.kelolatim.updateRole', { id: dashboardId, id_tim: tim.id }),
            { anggota_tim_id: anggotaTimId, new_role: newRole },
            { preserveScroll: true }
        );
    };
    // --- LOGIKA TIDAK DIUBAH (End) ---

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head title="Anggota Tim" />
            
            {/* Background Container Modern */}
            <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Anggota Tim</h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                Manajemen kolaborasi untuk tim <span className="font-semibold text-indigo-600">"{tim.nama_tim}"</span>.
                            </p>
                        </div>
                    </div>

                    {/* Search Bar Modern (Floating) */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari anggota tim..."
                            className="block w-full pl-11 pr-4 py-3.5 bg-white border-0 text-gray-900 placeholder-gray-400 rounded-2xl shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all sm:text-sm"
                        />
                    </div>

                    {errors?.message && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center shadow-sm">
                            <ShieldAlert className="h-5 w-5 mr-2" />
                            {errors.message}
                        </div>
                    )}

                    {/* Content List: Menggunakan Grid/Card Layout bukan Table */}
                    <div className="grid grid-cols-1 gap-4">
                        {anggota_list.length > 0 ? (
                            anggota_list.map((anggota) => {
                                
                                const isCurrentUser = anggota.id_users === currentAuth.id;
                                const isUneditable = (
                                    anggota.role_anggota && anggota.role_anggota.toLowerCase() === 'ketua tim' && 
                                    anggota.user_company_role && anggota.user_company_role.toLowerCase() === 'super user'
                                );
                                const isSelectDisabled = !currentAuth.canEdit || isCurrentUser || isUneditable;

                                return (
                                    <div 
                                        key={anggota.id} 
                                        className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            
                                            {/* Info User */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <UserAvatar src={anggota.user.poto_profile_user} name={anggota.user.name} />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {anggota.user.name}
                                                        {isCurrentUser && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                                Anda
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{anggota.user.email}</span>
                                                </div>
                                            </div>

                                            {/* Role & Actions Container */}
                                            <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 pl-[4rem] sm:pl-0">
                                                
                                                {/* Role Badge */}
                                                <div className="flex items-center gap-2">
                                                    <RoleBadge role={anggota.role_anggota} />
                                                    {isUneditable && (
                                                        <ShieldAlert className="h-4 w-4 text-amber-500" title="Super User - Role Locked" />
                                                    )}
                                                </div>

                                                {/* Select Dropdown Modern */}
                                                <div className="relative">
                                                    <select
                                                        value={anggota.role_anggota || 'Member'}
                                                        onChange={(e) => handleRoleChange(anggota.id, e.target.value)}
                                                        disabled={isSelectDisabled}
                                                        className={`appearance-none block w-32 pl-3 pr-8 py-2 text-xs font-medium rounded-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700 cursor-pointer transition-all ${
                                                            isSelectDisabled 
                                                                ? 'opacity-60 cursor-not-allowed bg-gray-100' 
                                                                : 'hover:bg-white hover:ring-gray-300'
                                                        }`}
                                                    >
                                                        <option value="Member">Member</option>
                                                        <option value="Ketua Tim">Ketua Tim</option>
                                                    </select>
                                                    {/* Custom Arrow Icon */}
                                                    {!isSelectDisabled && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-dashed border-gray-300 text-center">
                                <div className="rounded-full bg-gray-50 p-4 mb-3">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Tidak ada anggota ditemukan</h3>
                                <p className="mt-1 text-sm text-gray-500">Coba ubah kata kunci pencarian Anda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Proyek>
    );
}