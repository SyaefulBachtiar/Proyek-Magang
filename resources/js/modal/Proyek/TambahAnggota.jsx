import { usePage } from "@inertiajs/react";
import { X, Search, Plus } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";

export default function TambahAnggota({ close, tambahAnggota }) {
    const tambahRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const props = usePage().props;
    const anggota_tim = props.anggota_tim;
    const anggota_card = props.anggota_card;

    // Filter anggota card berdasarkan search query
    const filteredAnggotaCard = useMemo(() => {
        return anggota_card.filter((tim) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    tim.name.toLowerCase().includes(query) ||
                    (tim.email && tim.email.toLowerCase().includes(query))
                );
            }
            return true;
        });
    }, [anggota_card, searchQuery]);

    // Filter anggota tim berdasarkan search query
    const filteredAnggotaTim = useMemo(() => {
        return anggota_tim.filter((tim) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    tim.name.toLowerCase().includes(query) ||
                    (tim.email && tim.email.toLowerCase().includes(query))
                );
            }
            return true;
        });
    }, [anggota_tim, searchQuery]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (tambahRef.current && !tambahRef.current.contains(e.target)) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [close]);

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    // Handle select anggota
    const handleSelectAnggota = useCallback(
        async (anggota) => {
            setIsAdding(true);
            try {
                if (tambahAnggota) {
                    await tambahAnggota(anggota);
                }
                // Reset search setelah memilih
                setSearchQuery("");
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsAdding(false);
            }
        },
        [tambahAnggota]
    );

    return (
        <div
            ref={tambahRef}
            className="absolute top-11 right-32 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.25)] py-4 px-4 rounded-lg w-[300px] overflow-y-auto max-h-[400px]"
        >
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-semibold">Anggota</h1>
                <X
                    onClick={close}
                    className="cursor-pointer hover:bg-gray-100 rounded p-1"
                    size={20}
                />
            </div>

            {/* Search Input */}
            <div className="mb-4">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Cari nama anggota..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full rounded-lg pl-10 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Anggota Card Section */}
            <div className="mb-4">
                <h2 className="font-medium text-gray-700 mb-3 text-sm">
                    Anggota Card
                    {searchQuery && (
                        <span className="text-xs font-normal text-gray-500 ml-2">
                            ({filteredAnggotaCard.length} hasil)
                        </span>
                    )}
                </h2>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredAnggotaCard.length === 0 ? (
                        <div className="text-center text-gray-500 py-4 text-sm">
                            {searchQuery
                                ? "Tidak ada anggota card yang ditemukan"
                                : "Tidak ada anggota card"}
                        </div>
                    ) : (
                        filteredAnggotaCard.map((tim) => (
                            <div
                                key={tim.id}
                                onClick={() => handleSelectAnggota(tim)}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors"
                                disabled={isAdding}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                                        {tim.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">
                                            {tim.name}
                                        </h3>
                                        {tim.email && (
                                            <p className="text-xs text-gray-500">
                                                {tim.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    disabled={isAdding}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-opacity disabled:opacity-50"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Anggota Tim Section */}
            <div>
                <h2 className="font-medium text-gray-700 mb-3 text-sm">
                    Anggota Tim
                    {searchQuery && (
                        <span className="text-xs font-normal text-gray-500 ml-2">
                            ({filteredAnggotaTim.length} hasil)
                        </span>
                    )}
                </h2>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredAnggotaTim.length === 0 ? (
                        <div className="text-center text-gray-500 py-4 text-sm">
                            {searchQuery
                                ? "Tidak ada anggota tim yang ditemukan"
                                : "Tidak ada anggota tim"}
                        </div>
                    ) : (
                        filteredAnggotaTim.map((tim) => (
                            <div
                                key={tim.id}
                                onClick={() => handleSelectAnggota(tim)}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors"
                                disabled={isAdding}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs font-medium">
                                        {tim.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">
                                            {tim.name}
                                        </h3>
                                        {tim.email && (
                                            <p className="text-xs text-gray-500">
                                                {tim.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    disabled={isAdding}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-opacity disabled:opacity-50"
                                >
                                    <Plus size={14} className="text-blue-500" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Loading state */}
            {isAdding && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    Menambahkan anggota...
                </div>
            )}
        </div>
    );
}
