import { useEffect, useRef, useState } from "react";
import Dashboard, { DashboardState } from "../Dashboard";
import { usePage, Head, router } from "@inertiajs/react";
import { Edit, Trash2, Save, X } from "lucide-react";

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
    // Pastikan 'auth' diambil dari props
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

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "");

    const roleColor = {
        "Super User": "bg-blue-900",
        Admin: "bg-blue-700",
        Member: "bg-green-600",
        default: "bg-gray-500",
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
            // ✅ PERBAIKAN: Tambahkan parameter 'id' yang berasal dari user yang login
            route("aksestim.updateRole", {
                id: auth.user.id, // ID dari user yang sedang login
                user: member.id,   // ID dari user yang akan diubah rolenya
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
        const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus ${member.name}? Tindakan ini tidak dapat diurungkan.`);
        if (confirmDelete) {
            // Mengirim request hapus ke server
            router.delete(route('aksestim.destroy', {
                id: auth.user.id, // ID dari user yang login untuk parameter {id} di URL
                user: member.id,  // ID dari user yang akan dihapus untuk parameter {user}
            }), {
                preserveScroll: true, // Agar halaman tidak scroll ke atas setelah aksi
                onSuccess: () => {
                    setMenuOpen(null); // Menutup menu setelah berhasil
                }
            });
        }
    };

    return (
        <div className="p-8 min-h-screen">
            <h2 className="text-xl font-semibold mb-6">Anggota Perusahaan</h2>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Cari nama anggota..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="space-y-4 relative">
                {filteredMembers.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                        {searchQuery
                            ? "Tidak ada anggota ditemukan."
                            : "Belum ada anggota di tim ini."}
                    </p>
                )}

                {filteredMembers.map((member, index) => (
                    <div
                        key={member.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-800 font-bold flex items-center justify-center">
                                {getInitial(member.name)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">
                                    {member.name}
                                </span>

                                {editIndex === index ? (
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="mt-1 border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Member">Member</option>
                                    </select>
                                ) : (
                                    <span
                                        className={`text-white text-xs px-3 py-1 rounded-md w-fit ${
                                            roleColor[member.role] || roleColor.default
                                        }`}
                                    >
                                        {member.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {member.role !== "Super User" && (
                             <div className="relative" ref={(el) => (menuRefs.current[index] = el)}>
                                {editIndex === index ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSaveRole(member)}
                                            className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            Simpan
                                        </button>
                                        <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:text-gray-800">
                                            <X className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            onClick={() => toggleMenu(index)}
                                            className="text-gray-600 text-xl cursor-pointer hover:text-gray-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                                            </svg>
                                        </div>

                                        {menuOpen === index && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                                                <button
                                                    onClick={() => handleEditClick(member, index)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Hapus
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}