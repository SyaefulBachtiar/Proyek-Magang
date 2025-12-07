import React, { useState, Fragment } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { 
    Search, Trash2, CheckCircle, XCircle, Shield, 
    LogOut, Lock, Users, Building2, ChevronDown, ChevronUp, User,
    Eye, EyeOff
} from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';

export default function AdminDashboard({ companies, filters }) {
    const [term, setTerm] = useState(filters.term || '');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [expandedCompanyId, setExpandedCompanyId] = useState(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.dashboard'), { term }, { preserveState: true });
    };

    const toggleExpand = (id) => {
        if (expandedCompanyId === id) {
            setExpandedCompanyId(null);
        } else {
            setExpandedCompanyId(id);
        }
    };

    const submitPassword = (e) => {
        e.preventDefault();
        put(route('admin.password.update'), {
            onSuccess: () => {
                setShowPasswordModal(false);
                reset();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                alert('Password berhasil diperbarui!');
            },
        });
    };

    const StatusBadge = ({ status }) => {
        const config = {
            active: { class: "bg-green-100 text-green-800 border-green-200", label: "Aktif" },
            inactive: { class: "bg-red-100 text-red-800 border-red-200", label: "Non-Aktif" },
            pending: { class: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Menunggu" },
        };
        const current = config[status] || config.pending;
        
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${current.class}`}>
                {current.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
            <Head title="Administrator Dashboard" />

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0f172a] text-white flex-shrink-0 fixed h-full z-50 transition-all shadow-xl">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-green-500" />
                    <div>
                        <h1 className="text-lg font-bold tracking-wider">ADMIN</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Control Panel</p>
                    </div>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-600 rounded-lg text-white shadow-lg cursor-default">
                        <Building2 size={20} />
                        <span className="font-medium text-sm">Data Perusahaan</span>
                    </div>
                    <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
                        <Lock size={20} />
                        <span className="font-medium text-sm">Ganti Password</span>
                    </button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors w-full px-4 py-2">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Keluar</span>
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manajemen Perusahaan</h2>
                        <p className="text-gray-500 text-sm mt-1">Daftar perusahaan, owner, dan anggota tim.</p>
                    </div>
                    <form onSubmit={handleSearch} className="relative w-full md:w-72">
                        <input type="text" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Cari Perusahaan / Owner..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm shadow-sm" />
                        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 py-3 px-4 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        <div className="col-span-4">Perusahaan & Owner</div>
                        <div className="col-span-3">Kontak Owner</div>
                        <div className="col-span-2 text-center">Status Owner</div>
                        <div className="col-span-2 text-center">Anggota</div>
                        <div className="col-span-1 text-center">Aksi</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {companies.data.length > 0 ? (
                            companies.data.map((company) => (
                                <Fragment key={company.id}>
                                    {/* BARIS UTAMA (PERUSAHAAN) */}
                                    <div 
                                        className={`grid grid-cols-12 items-center py-4 px-4 transition-colors cursor-pointer hover:bg-gray-50 ${expandedCompanyId === company.id ? 'bg-green-50/50' : ''}`}
                                        onClick={() => toggleExpand(company.id)}
                                    >
                                        <div className="col-span-4 flex items-center gap-3">
                                            <button className="p-1 rounded hover:bg-gray-200 text-gray-500 transition">
                                                {expandedCompanyId === company.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            <div>
                                                <div className="font-bold text-gray-800 text-base flex items-center gap-2">
                                                    {company.nama_perusahaan || <span className="italic text-gray-400 text-sm">Belum diberi nama</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <User size={12} />
                                                    Owner: {company.user?.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-3 text-sm text-gray-600 truncate pr-4">
                                            {company.user?.email}
                                        </div>

                                        <div className="col-span-2 text-center">
                                            <StatusBadge status={company.user?.status} />
                                        </div>

                                        <div className="col-span-2 text-center text-sm font-medium text-gray-600">
                                            {company.anggota_perusahaan?.length || 0} User
                                        </div>

                                        <div className="col-span-1 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {/* Tombol Aksi Owner */}
                                            {company.user?.status !== 'active' ? (
                                                <Link href={route('admin.user.approve', company.user.id)} method="put" as="button" className="text-green-600 hover:bg-green-100 p-1.5 rounded" title="Aktifkan Owner">
                                                    <CheckCircle size={18} />
                                                </Link>
                                            ) : (
                                                <Link href={route('admin.user.deactivate', company.user.id)} method="put" as="button" className="text-yellow-600 hover:bg-yellow-100 p-1.5 rounded" title="Nonaktifkan Owner">
                                                    <XCircle size={18} />
                                                </Link>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    if(confirm('Hapus Perusahaan ini beserta Owner dan seluruh karyawannya?')) {
                                                        router.delete(route('admin.user.destroy', company.user.id));
                                                    }
                                                }}
                                                className="text-red-600 hover:bg-red-100 p-1.5 rounded" title="Hapus Permanen">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedCompanyId === company.id && (
                                        <div className="col-span-12 bg-gray-50/80 border-b border-gray-100 p-4 pl-14">
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-3">Daftar Anggota Perusahaan</div>
                                            {company.anggota_perusahaan && company.anggota_perusahaan.length > 0 ? (
                                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                                                            <tr>
                                                                <th className="px-4 py-2">Nama User</th>
                                                                <th className="px-4 py-2">Email</th>
                                                                <th className="px-4 py-2">Role</th>
                                                                <th className="px-4 py-2">Jabatan</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {company.anggota_perusahaan.map((anggota) => (
                                                                <tr key={anggota.id} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-2 font-medium text-gray-700 flex items-center gap-2">
                                                                        {anggota.user?.poto_profile_user ? (
                                                                            <img src={`/storage/${anggota.user.poto_profile_user}`} className="w-6 h-6 rounded-full" />
                                                                        ) : (
                                                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                                                {anggota.user?.name?.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                        {anggota.user?.name}
                                                                        {anggota.user?.id === company.user_id && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded border border-green-200 ml-2">OWNER</span>}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-gray-500">{anggota.user?.email}</td>
                                                                    <td className="px-4 py-2 text-gray-500">{anggota.role}</td>
                                                                    <td className="px-4 py-2 text-gray-500">{anggota.jabatan || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">Belum ada anggota lain selain owner.</div>
                                            )}
                                        </div>
                                    )}
                                </Fragment>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">Belum ada data perusahaan.</div>
                        )}
                    </div>

                    {/* Pagination */}
                     {companies.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                            <div className="flex flex-wrap gap-1">
                                {companies.links.map((link, i) => {
                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                                link.active ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-xs font-medium rounded-md bg-white border border-gray-200 text-gray-300 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
                 <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Ganti Password Admin</h2>
                    <form onSubmit={submitPassword} className="space-y-5 mt-4">
                                                <div>
                            <InputLabel htmlFor="current_password" value="Password Saat Ini" />
                            <div className="relative mt-1">
                                <TextInput 
                                    id="current_password" 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    className="block w-full pr-10" 
                                    value={data.current_password} 
                                    onChange={(e) => setData('current_password', e.target.value)} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError message={errors.current_password} className="mt-2" />
                        </div>

                        {/* Password Baru */}
                        <div>
                            <InputLabel htmlFor="password" value="Password Baru" />
                            <div className="relative mt-1">
                                <TextInput 
                                    id="password" 
                                    type={showNewPassword ? "text" : "password"} 
                                    className="block w-full pr-10" 
                                    value={data.password} 
                                    onChange={(e) => setData('password', e.target.value)} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Konfirmasi Password */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                            <div className="relative mt-1">
                                <TextInput 
                                    id="password_confirmation" 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    className="block w-full pr-10" 
                                    value={data.password_confirmation} 
                                    onChange={(e) => setData('password_confirmation', e.target.value)} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <div className="flex justify-end mt-8 gap-3">
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Batal</button>
                            <PrimaryButton disabled={processing}>Simpan Password</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}