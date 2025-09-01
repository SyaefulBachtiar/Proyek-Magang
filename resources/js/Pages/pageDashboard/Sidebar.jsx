import { router, usePage } from "@inertiajs/react";
import {
    ChevronRight,
    FolderKanban,
    House,
    ListFilterIcon,
    Search,
    Settings,
    ShieldCheck,
    UserRound,
    Medal,
    FolderOpenDot,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ sidebarOpen, activePage, id }) {
    const { timPerusahaan, role } = usePage().props;

    const proyekTim =
        timPerusahaan?.filter((tim) => tim.jenis_tim === "proyek") || [];
    const timBiasa =
        timPerusahaan?.filter((tim) => tim.jenis_tim === "tim") || [];

    const [dropdownProyek, setDropwdownProyek] = useState(false);
    const [dropdownTim, setDropdownTim] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Fungsi untuk filter berdasarkan search query
    const filteredProyekTim = proyekTim.filter((tim) =>
        tim.nama_tim.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTimBiasa = timBiasa.filter((tim) =>
        tim.nama_tim.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fungsi untuk highlight text yang cocok dengan search
    const highlightText = (text, query) => {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 font-semibold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Auto-expand dropdown jika ada hasil pencarian
        if (query && filteredProyekTim.length > 0) {
            setDropwdownProyek(true);
        }
        if (query && filteredTimBiasa.length > 0) {
            setDropdownTim(true);
        }

        // Collapse dropdown jika tidak ada query
        if (!query) {
            setDropwdownProyek(false);
            setDropdownTim(false);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
        setDropwdownProyek(false);
        setDropdownTim(false);
        setIsSearchFocused(false)
    };

    // Handle search focus
    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        // Delay to allow click events on dropdown items
        setTimeout(() => {
            if (!searchQuery) {
                setIsSearchFocused(false);
            }
        }, 200);
    };

    return (
        <>
            <div className="w-full flex flex-col justify-end my-10 rounded-lg gap-6 overflow-y-auto">
                {/* Home sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-[#F4F4F4] ${
                        activePage === "DashboardMain" ? "bg-[#F4F4F4]" : ""
                    }`}
                    onClick={() =>
                        router.visit(route("dashboard.with.id", { id }))
                    }
                >
                    <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                        <div
                            className={`px-[5px] rounded-lg h-[42px] flex items-center`}
                        >
                            <div className="w-8 h-8 flex justify-center items-center">
                                <House size={25} />
                            </div>
                        </div>
                        <p className="w-[80px] flex-shrink-0">Dashboard</p>
                    </div>
                </div>

                {/* search sidebar */}
                <div className="w-full group cursor-pointer">
                    <div className="w-full group flex overflow-hidden gap-4 relative items-center py-1 px-[2px]">
                        <Search
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={25}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                            className={`pr-4 py-2 border-none rounded-lg focus:border-gray-400 focus:ring-gray-400 transition-all delay-150 ease-in-out duration-200 group-hover:pl-10 focus:pl-10 group-hover:w-full focus:w-full h-full ${
                                sidebarOpen ? "w-0 pl-6" : "w-0 pl-6"
                            }`}
                            placeholder="Cari tim..."
                        />
                        {!isSearchFocused && !searchQuery && (
                            <p className="group-hover:hidden focus-within:hidden transition-all delay-150 ease-in-out duration-300 pointer-events-none">
                                Cari
                            </p>
                        )}

                        {/* Clear search button */}
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-16 bg-white top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5 hidden items-center justify-center transition-all delay-150 ease-in-out duration-200 group-hover:flex"
                            >
                                <X />
                            </button>
                        )}

                        <div className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                            <ListFilterIcon className="w-5 h-5" />
                        </div>
                    </div>

                    {/* hasil search */}
                    <div
                        className={`w-full overflow-hidden transition-all delay-150 ease-in-out duration-300 flex flex-col gap-2 ${
                            isSearchFocused || searchQuery
                                ? "min-h-auto mt-4 p-2"
                                : "hidden group-hover:min-h-[100px] group-hover:flex group-hover:mt-4 group-hover:p-2"
                        }`}
                    >
                        {/* Show no results message */}
                        {searchQuery &&
                            filteredProyekTim.length === 0 &&
                            filteredTimBiasa.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    <p>Tidak ada hasil untuk "{searchQuery}"</p>
                                </div>
                            )}

                        {/* Proyek Section */}
                        {(!searchQuery || filteredProyekTim.length > 0) && (
                            <div className="group/chevron">
                                <div
                                    onClick={() =>
                                        setDropwdownProyek(!dropdownProyek)
                                    }
                                    className="flex justify-between items-center hover:bg-gray-200 py-2 px-1 rounded-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderKanban />
                                        <h1>
                                            Proyek{" "}
                                            {searchQuery &&
                                                `(${filteredProyekTim.length})`}
                                        </h1>
                                    </div>
                                    <ChevronRight
                                        className={`hidden group-hover/chevron:flex transition-all ease-in-out duration-200 ${
                                            dropdownProyek ? "rotate-90" : ""
                                        }`}
                                    />
                                </div>
                                {dropdownProyek && (
                                    <div className="w-full min-h-20">
                                        <ul className="relative ml-3 mt-2">
                                            {/* Garis vertikal utama */}
                                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400"></div>

                                            {filteredProyekTim.map(
                                                (tim, index) => (
                                                    <li
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "proyek",
                                                                    {
                                                                        id: id,
                                                                        id_tim: tim.id,
                                                                        id_board:
                                                                            tim
                                                                                .board_tim
                                                                                ?.id,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                        key={tim.id}
                                                        className="relative rounded-md py-2 hover:bg-gray-200 m-2 flex items-center gap-2 pl-4 cursor-pointer"
                                                    >
                                                        {/* Garis horizontal untuk setiap item */}
                                                        <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-400 -translate-y-1/2"></div>

                                                        {/* Titik konektor */}
                                                        <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full -translate-y-1/2 -translate-x-1/2"></div>

                                                        {/* Garis vertikal terputus untuk item terakhir */}
                                                        {index ===
                                                            filteredProyekTim.length -
                                                                1 && (
                                                            <div className="absolute left-0 top-1/2 bottom-0 w-px bg-white"></div>
                                                        )}

                                                        <FolderOpenDot className="text-blue-500" />
                                                        <p className="text-sm">
                                                            {highlightText(
                                                                tim.nama_tim,
                                                                searchQuery
                                                            )}
                                                        </p>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tim Section */}
                        {(!searchQuery || filteredTimBiasa.length > 0) && (
                            <div className="group/chevron">
                                <div
                                    onClick={() => setDropdownTim(!dropdownTim)}
                                    className="flex justify-between items-center hover:bg-gray-200 py-2 px-1 rounded-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users />
                                        <h1>
                                            Tim{" "}
                                            {searchQuery &&
                                                `(${filteredTimBiasa.length})`}
                                        </h1>
                                    </div>
                                    <ChevronRight
                                        className={`hidden group-hover/chevron:flex transition-all ease-in-out duration-200 ${
                                            dropdownTim ? "rotate-90" : ""
                                        }`}
                                    />
                                </div>
                                {dropdownTim && (
                                    <div className="w-full min-h-20">
                                        <ul className="relative ml-3 mt-2">
                                            {/* Garis vertikal utama */}
                                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400"></div>

                                            {filteredTimBiasa.map(
                                                (anggota, index) => (
                                                    <li
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "proyek",
                                                                    {
                                                                        id: id,
                                                                        id_tim: anggota.id,
                                                                        id_board:
                                                                            anggota
                                                                                .board_tim
                                                                                ?.id,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                        key={anggota.id}
                                                        className="relative rounded-md hover:bg-gray-200 m-2 flex items-center gap-2 pl-4 py-2 cursor-pointer"
                                                    >
                                                        {/* Garis horizontal untuk setiap item */}
                                                        <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-400 -translate-y-1/2"></div>

                                                        {/* Titik konektor */}
                                                        <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full -translate-y-1/2 -translate-x-1/2"></div>

                                                        {/* Garis vertikal terputus untuk item terakhir */}
                                                        {index ===
                                                            filteredTimBiasa.length -
                                                                1 && (
                                                            <div className="absolute left-0 top-1/2 bottom-0 w-px bg-white"></div>
                                                        )}

                                                        <FolderOpenDot className="text-green-500" />
                                                        <p className="text-sm">
                                                            {highlightText(
                                                                anggota.nama_tim,
                                                                searchQuery
                                                            )}
                                                        </p>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {role !== "Member" ? (
                    <>
                        {/* akses tim sidebar */}
                        <div
                            className={`w-full group cursor-pointer rounded-md hover:bg-[#F4F4F4] ${
                                activePage === "DashboardAksesTim"
                                    ? "bg-[#F4F4F4]"
                                    : ""
                            }`}
                            onClick={() =>
                                router.visit(route("aksestim", { id }))
                            }
                        >
                            <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                                <div
                                    className={`px-[5px] rounded-lg h-[42px] border-gray-300 flex items-center`}
                                >
                                    <div className="w-8 h-8 flex justify-center items-center">
                                        <ShieldCheck size={25} />
                                    </div>
                                </div>
                                <p className="w-[80px] flex-shrink-0">
                                    Akses Tim
                                </p>
                            </div>
                        </div>

                        {/* Pengaturan sidebar */}
                        <div
                            className={`w-full group cursor-pointer rounded-md hover:bg-[#F4F4F4] ${
                                activePage === "DashboardPengaturan"
                                    ? "bg-[#F4F4F4]"
                                    : ""
                            }`}
                            onClick={() =>
                                router.visit(route("pengaturan", { id }))
                            }
                        >
                            <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                                <div
                                    className={`px-[5px] rounded-lg h-[42px] flex items-center`}
                                >
                                    <div className="w-8 h-8 flex justify-center items-center">
                                        <Settings size={25} />
                                    </div>
                                </div>
                                <p className="w-[80px] flex-shrink-0">
                                    Pengaturan
                                </p>
                            </div>
                        </div>

                        {/* leaderboard sidebar */}
                        <div
                            className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                                activePage === "DashboardLeaderboard"
                                    ? "bg-gray-200"
                                    : ""
                            }`}
                            onClick={() =>
                                router.visit(route("leaderboard", { id }))
                            }
                        >
                            <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                                <div
                                    className={`px-[5px] rounded-lg h-[42px] flex items-center`}
                                >
                                    <div className="w-8 h-8 flex justify-center items-center">
                                        <Medal size={25}/>
                                    </div>
                                </div>
                                <p className="w-[80px] flex-shrink-0">
                                    Leaderboard
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    ""
                )}
            </div>
        </>
    );
}
