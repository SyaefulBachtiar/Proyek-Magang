import { router, usePage } from "@inertiajs/react";
import { X, Search, Plus } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";

export default function TambahAnggota({
    close,
    tambahAnggota,
    id_tim,
    card_id,
    refTrigger,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const user = usePage().props.auth.user;

    const props = usePage().props;
    const anggota_tim = props.anggota_tim;
    const anggota_card = props.anggota_card;

    const modalRef = useRef(null);

    const filteredAnggotaCard = useMemo(() => {
        const filtered = anggota_card.filter((tim) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    tim.name.toLowerCase().includes(query) ||
                    (tim.email && tim.email.toLowerCase().includes(query))
                );
            }
            return true;
        });

        return filtered.sort((a, b) => {
            if (a.id === user.id) return -1;
            if (b.id === user.id) return 1;
            return 0;
        });
    }, [anggota_card, searchQuery, user.id]);

    const filteredAnggotaTim = useMemo(() => {
        const anggotaCardIds = new Set(anggota_card.map((card) => card.id));

        const filtered = anggota_tim.filter((tim) => {
            if (anggotaCardIds.has(tim.id)) {
                return false;
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    tim.name.toLowerCase().includes(query) ||
                    (tim.email && tim.email.toLowerCase().includes(query))
                );
            }
            return true;
        });
        return filtered.sort((a, b) => {
            if (a.id === user.id) return -1;
            if (b.id === user.id) return 1;
            return 0;
        });
    }, [anggota_tim, anggota_card, searchQuery, user.id]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                refTrigger &&
                !refTrigger.contains(e.target)
            ) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [close, refTrigger]);
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleSelectAnggota = useCallback(
        async (anggota) => {
            setIsAdding(true);
            try {
                if (tambahAnggota) {
                    await tambahAnggota(anggota);
                }
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
            ref={modalRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm md:absolute md:top-11 md:right-10 md:w-auto md:min-w-[300px] md:max-w-none md:transform-none bg-white shadow-[0_5px_10px_rgba(0,0,0,0.25)] py-3 px-3 md:py-4 md:px-4 rounded-lg max-h-[85vh] md:max-h-[400px] flex flex-col z-50"
        >
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <h1 className="text-base md:text-lg font-semibold">Anggota</h1>
                <X
                    onClick={close}
                    className="cursor-pointer hover:bg-gray-100 rounded p-1.5 md:p-1"
                    size={20}
                />
            </div>

            <div className="mb-3 md:mb-4">
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
                        className="w-full rounded-lg pl-10 pr-4 py-2.5 md:py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto my-scrollable-element space-y-3 md:space-y-4">
                <div>
                    <h2 className="font-medium text-gray-700 mb-2 md:mb-3 text-sm">
                        Anggota Card
                        {searchQuery && (
                            <span className="text-xs font-normal text-gray-500 ml-2">
                                ({filteredAnggotaCard.length} hasil)
                            </span>
                        )}
                    </h2>

                    <div className="space-y-1">
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
                                    className="flex items-center justify-between p-1.5 md:p-2 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors flex-wrap"
                                    disabled={isAdding}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                                            {tim.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-medium truncate">
                                                {tim.name === user.name
                                                    ? "Anda"
                                                    : tim.name}
                                            </h3>
                                            {tim.email && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {tim.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route("proyek.card.destroy", {
                                                    id: user.id,
                                                    id_user: tim.id,
                                                    cardId: card_id,
                                                })
                                            )
                                        }
                                        className={`opacity-100 md:opacity-0 group-hover:md:opacity-100 p-1.5 md:p-1 hover:bg-gray-100 rounded transition-opacity disabled:opacity-50 ${
                                            tim.name === user.name &&
                                            tim.role === "Ketua tim"
                                                ? "hidden"
                                                : "flex"
                                        }`}
                                    >
                                        <X size={14} className="text-red-600" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="font-medium text-gray-700 mb-2 md:mb-3 text-sm">
                        Anggota Tim
                        {searchQuery && (
                            <span className="text-xs font-normal text-gray-500 ml-2">
                                ({filteredAnggotaTim.length} hasil)
                            </span>
                        )}
                    </h2>

                    <div className="space-y-1">
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
                                    className="flex items-center justify-between p-1.5 md:p-2 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors"
                                    disabled={isAdding}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                                            {tim.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-medium truncate">
                                                {tim.name === user.name
                                                    ? "Anda"
                                                    : tim.name}
                                            </h3>
                                            {tim.email && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {tim.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        disabled={isAdding}
                                        className="opacity-100 md:opacity-0 group-hover:md:opacity-100 p-1.5 md:p-1 hover:bg-blue-100 rounded transition-opacity disabled:opacity-50"
                                    >
                                        <Plus
                                            onClick={() =>
                                                router.post(
                                                    route("proyek.card.invite", {
                                                        id: user.id,
                                                        id_user: tim.id,
                                                        cardId: card_id,
                                                    })
                                                )
                                            }
                                            size={14}
                                            className={`text-blue-500 ${
                                                tim.name === user.name
                                                    ? "hidden"
                                                    : "flex"
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isAdding && (
                <div className="mt-3 md:mt-4 text-center text-sm text-gray-500">
                    Menambahkan anggota...
                </div>
            )}
        </div>
    );
}