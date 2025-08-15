import { usePage } from "@inertiajs/react";
import { X, Search, Plus } from "lucide-react";
import { useState, useMemo, useCallback } from "react";

export default function TambahAnggotaBoard({ close }) {
    // Ambil 'tim' dan 'auth' dari props
    const { anggota_tim, anggota_board, tim, auth } = usePage().props;

    // State untuk search dan role
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("Member");
    const [isAdding, setIsAdding] = useState(false);

    // Filter anggota tim berdasarkan search query saja (tetap tampilkan semua)
    const filteredAnggotaTim = useMemo(() => {
        const anggotaBoardIds = new Set(
            anggota_board.map((anggota) => anggota.id)
        );

        return anggota_tim
            .filter((anggota) => {
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    return (
                        anggota.name.toLowerCase().includes(query) ||
                        (anggota.email &&
                            anggota.email.toLowerCase().includes(query))
                    );
                }
                return true;
            })
            .map((anggota) => ({
                ...anggota,
                isInBoard: anggotaBoardIds.has(anggota.id),
            }));
    }, [anggota_tim, anggota_board, searchQuery]);

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    // Handle tambah anggota ke board
    const handleTambahAnggota = useCallback(
        async (anggota) => {
            if (anggota.isInBoard) {
                alert("Anggota sudah ada di board");
                return;
            }

            // Validasi di sisi frontend untuk memastikan data tim dan auth ada
            if (!tim || !tim.id || !auth || !auth.user || !auth.user.id) {
                console.error("ID Tim atau ID User tidak ditemukan di props!");
                alert("Gagal menambahkan anggota: Data sesi tidak lengkap.");
                return;
            }

            setIsAdding(true);
            try {
                // URL diperbaiki agar sepenuhnya dinamis
                const response = await fetch(`/dashboard/${auth.user.id}/proyek/${tim.id}/anggota`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    body: JSON.stringify({
                        id_users: anggota.id,
                        role_anggota: selectedRole,
                    }),
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Gagal menambahkan anggota");
                    console.error("Gagal menambahkan anggota:", errorData);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Terjadi kesalahan saat menambahkan anggota.");
            } finally {
                setIsAdding(false);
            }
        },
        [selectedRole, tim, auth] // Tambahkan 'auth' sebagai dependency
    );

    // Handle hapus anggota dari board (Fungsi ini tidak diubah)
    const handleHapusAnggota = useCallback(async (anggotaId) => {
        try {
            const response = await fetch(`/api/board/anggota/${anggotaId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error("Gagal menghapus anggota");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);

    return (
        <div className="fixed top-0 bg-black/20 w-screen h-screen z-50 flex justify-center items-center">
            <div className="p-5 bg-white relative rounded-lg w-[500px] px-8 max-h-[80vh] overflow-y-auto">
                <X
                    onClick={close}
                    className="cursor-pointer absolute top-0 right-0 m-5 hover:bg-gray-100 rounded p-1"
                    size={24}
                />

                <div className="mt-4">
                    <h1 className="text-xl font-semibold">Tambahkan Anggota</h1>
                    <div className="flex gap-3 mt-5">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Cari anggota..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            className="bg-white border border-gray-300 text-sm rounded-lg pr-7 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            required
                        >
                            <option value="Member">Member</option>
                            <option value="Ketua tim">Ketua tim</option>
                        </select>
                    </div>

                    {anggota_board.length > 0 && (
                        <div className="mt-6">
                            <h2 className="font-medium text-gray-700 mb-3">
                                Anggota Board ({anggota_board.length})
                            </h2>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {anggota_board.map((anggota) => (
                                    <div
                                        key={anggota.id}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                                                {anggota.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{anggota.name}</p>
                                                <p className="text-xs text-gray-500">{anggota.role}</p>
                                            </div>
                                        </div>
                                        {anggota.role !== "owner" && (
                                            <button
                                                onClick={() => handleHapusAnggota(anggota.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                                            >
                                                <X size={14} className="text-red-500"/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h2 className="font-medium text-gray-700 mb-3">
                            Anggota Perusahaan
                            {searchQuery && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    ({filteredAnggotaTim.length} hasil)
                                </span>
                            )}
                        </h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredAnggotaTim.length > 0 ? (
                                filteredAnggotaTim.map((anggota) => (
                                    <div
                                        key={anggota.id}
                                        className={`flex items-center justify-between p-2 rounded-lg group cursor-pointer transition-colors ${
                                            anggota.isInBoard
                                                ? "bg-green-50 hover:bg-green-100"
                                                : "hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            !anggota.isInBoard && handleTambahAnggota(anggota)
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium ${
                                                    anggota.isInBoard ? "bg-green-600" : "bg-gray-600"
                                                }`}
                                            >
                                                {anggota.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium flex items-center gap-2">
                                                    {anggota.name}
                                                    {anggota.isInBoard && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                            Sudah di Board
                                                        </span>
                                                    )}
                                                </h3>
                                                {anggota.email && (
                                                    <p className="text-xs text-gray-500">{anggota.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        {!anggota.isInBoard && (
                                            <button
                                                disabled={isAdding}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-opacity disabled:opacity-50"
                                            >
                                                <Plus size={16} className="text-blue-500"/>
                                            </button>
                                        )}
                                        {anggota.isInBoard && (
                                            <div className="text-green-600">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {searchQuery ? (
                                        <div>
                                            <p>Tidak ada anggota yang cocok dengan pencarian</p>
                                            <p className="text-sm mt-1">"{searchQuery}"</p>
                                        </div>
                                    ) : (
                                        <p>Tidak ada anggota perusahaan</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {isAdding && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Menambahkan anggota...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}