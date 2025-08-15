import { usePage } from "@inertiajs/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TambahAnggota({ close, tambahAnggota }) {
    const tambahRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");

    const props = usePage().props;
    const anggota_tim = props.anggota_tim;

    // Filter anggota berdasarkan search query
    const filteredAnggota = anggota_tim.filter((tim) =>
        tim.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectAnggota = (anggota) => {
        if (tambahAnggota) {
            tambahAnggota(anggota);
        }
        // Optional: reset search setelah memilih
        setSearchQuery("");
    };

    return (
        <div
            ref={tambahRef}
            className="absolute top-11 right-32 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.25)] py-2 px-4 rounded-lg w-[250px] overflow-y-auto max-h-[272px]"
        >
            <div className="flex justify-end">
                <X onClick={close} className="cursor-pointer" size={16} />
            </div>
            <h1 className="text-center mb-2 text-lg">Anggota</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari nama anggota..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="mb-2 rounded-md h-10 text-sm w-full px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <h1 className="mb-2">Anggota Tim</h1>

                {filteredAnggota.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        {searchQuery
                            ? "Tidak ada anggota yang ditemukan"
                            : "Tidak ada anggota tim"}
                    </div>
                ) : (
                    <div className="flex flex-col mt-2 pb-2">
                        {filteredAnggota.map((tim) => (
                            <div
                                key={tim.id}
                                onClick={() => handleSelectAnggota(tim)}
                                className="hover:bg-gray-200 cursor-pointer flex items-center gap-2 rounded-lg p-2 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-[50%] bg-blue-500 flex items-center justify-center text-white">
                                    <p className="text-sm font-medium">
                                        {tim.name.charAt(0)}
                                    </p>
                                </div>
                                <h1 className="text-sm">{tim.name}</h1>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
