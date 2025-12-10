import { useEffect, useRef, useState } from "react";
import Dashboard, { DashboardState } from "../Dashboard";
import { usePage, Head, router } from "@inertiajs/react";
import { Edit, Trash2, Save, X, Search, MoreVertical, ShieldCheck, User } from "lucide-react";

export default function ContentAksesTim() {
    return (
        <Dashboard>
            <Head title="Akses Tim" />
            <AksesTim />
        </Dashboard>
    );
}

function AksesTim() {
    const { props } = usePage();
    const { activePage, tim, auth } = props;

    const { setActivePage } = DashboardState();

    const [menuOpen, setMenuOpen] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [editIndex, setEditIndex] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");

    const menuRefs = useRef([]);

    useEffect(() => {
        if (setActivePage && activePage) {
            setActivePage(activePage);
        }
    }, [activePage]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                menuOpen !== null &&
                menuRefs.current[menuOpen] &&
                !menuRefs.current[menuOpen].contains(e.target)
            ) {
                setMenuOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const filteredMembers = (tim || []).filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Style Modern untuk Badge Role (Pastel Colors)
    const roleColor = {
        "Super User": "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20",
        "Admin": "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
        "Member": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
        "default": "bg-gray-50 text-gray-600 ring-1 ring-gray-600/20",
    };

    const toggleMenu = (index) => {
        setMenuOpen((prev) => (prev === index ? null : index));
    };

    const handleEditClick = (member, index) => {
        setEditIndex(index);
        setSelectedRole(member.role);
        setMenuOpen(null);
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
    };

    const handleSaveRole = (member) => {
        router.put(
            route("aksestim.updateRole", {
                id: auth.user.id,
                user: member.id,
            }),
            { role: selectedRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditIndex(null);
                },
            }
        );
    };

    const handleDelete = (member) => {
        const confirmDelete = window.confirm(
            `Apakah Anda yakin ingin menghapus ${member.name}? Tindakan ini tidak dapat diurungkan.`
        );
        if (confirmDelete) {
            router.delete(
                route("aksestim.destroy", {
                    id: auth.user.id,
                    user: member.id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setMenuOpen(null);
                    },
                }
            );
        }
    };

    return (
        <div className="p-6 lg:p-10 min-h-screen bg-slate-50/50 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Anggota Perusahaan
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">Kelola akses dan peran anggota tim Anda di sini.</p>
                </div>

                {/* Search Bar Modern */}
                <div className="relative group max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama anggota..."
                        className="block w-full pl-10 pr-4 py-3 bg-white border-0 text-gray-900 placeholder-gray-400 rounded-2xl shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Content List */}
                <div className="space-y-4">
                    {filteredMembers.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="text-gray-400 w-8 h-8" />
                            </div>
                            <p className="text-gray-500 font-medium">
                                {searchQuery
                                    ? `Tidak ada anggota dengan nama "${searchQuery}"`
                                    : "Belum ada anggota di tim ini."}
                            </p>
                        </div>
                    )} 

                    {filteredMembers.map((member, index) => (
                        <div
                            key={member.id}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center space-x-4 w-full sm:w-auto">
                                {/* Avatar dengan Ring & Shadow */}
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={member.poto_profile_user || `https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=c7d2fe&color=3730a3&size=64`} 
                                        alt={member.name} 
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                    />
                                    {/* Indikator Online/Status (Opsional Visual) */}
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                                        {member.name}
                                    </span>
                                    <span className="text-sm text-slate-500 truncate">
                                        {member.email}
                                    </span>
                                </div>
                            </div>

                            {/* Bagian Role & Action */}
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                                
                                {editIndex === index ? (
                                    // Mode Edit Modern
                                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="block w-32 pl-3 pr-8 py-2 text-sm border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 rounded-lg bg-gray-50 cursor-pointer"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Member">Member</option>
                                        </select>
                                    </div>
                                ) : (
                                    // Tampilan Badge Modern (Pill Shape)
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                                            roleColor[member.role] || roleColor.default
                                        }`}
                                    >
                                        {member.role === 'Super User' && <ShieldCheck className="w-3 h-3 mr-1.5" />}
                                        {member.role}
                                    </span>
                                )}

                                {member.role !== "Super User" && (
                                    <div
                                        className="relative"
                                        ref={(el) => (menuRefs.current[index] = el)}
                                    >
                                        {editIndex === index ? (
                                            // Action Buttons saat Edit
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSaveRole(member)}
                                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                                                    title="Simpan"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-2 bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                                    title="Batal"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            // Tombol Menu Titik Tiga
                                            <>
                                                <button
                                                    onClick={() => toggleMenu(index)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {menuOpen === index && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleEditClick(member, index)}
                                                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4 text-gray-400" />
                                                                Ubah Role
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(member)}
                                                                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-sm text-rose-600 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Hapus Anggota
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}