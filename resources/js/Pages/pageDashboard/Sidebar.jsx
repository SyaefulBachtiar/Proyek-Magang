import { router, usePage } from "@inertiajs/react";
import {
    ChevronRight,
    FolderKanban,
    House,
    Medal,
    Search,
    Settings,
    ShieldCheck,
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

    const filteredProyekTim = proyekTim.filter((tim) =>
        tim.nama_tim.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTimBiasa = timBiasa.filter((tim) =>
        tim.nama_tim.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query && filteredProyekTim.length > 0) setDropwdownProyek(true);
        if (query && filteredTimBiasa.length > 0) setDropdownTim(true);
        if (!query) {
            setDropwdownProyek(false);
            setDropdownTim(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setDropwdownProyek(false);
        setDropdownTim(false);
        setIsSearchFocused(false);
    };

    const handleSearchFocus = () => setIsSearchFocused(true);
    const handleSearchBlur = () => {
        setTimeout(() => {
            if (!searchQuery) setIsSearchFocused(false);
        }, 200);
    };

    const MenuItem = ({ icon: Icon, label, active, onClick }) => (
        <div
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group/item ${
                active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-center min-w-[24px]">
                <Icon size={22} strokeWidth={2} />
            </div>
            <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    sidebarOpen
                        ? "w-full opacity-100"
                        : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                }`}
            >
                {label}
            </span>
        </div>
    );

    return (
        <div className="group flex flex-col h-full w-full py-6 gap-2 overflow-x-hidden overflow-y-hidden hover:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <MenuItem
                icon={House}
                label="Dashboard"
                active={activePage === "DashboardMain"}
                onClick={() => router.visit(route("dashboard.with.id", { id }))}
            />

            <div className="w-full flex flex-col relative my-2">
                <div className="relative flex items-center w-full px-3 py-2">
                    <div className="absolute left-3 z-10 text-gray-500">
                        <Search size={22} strokeWidth={2} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        className={`w-full pl-10 pr-8 py-2.5 bg-transparent border border-transparent rounded-xl text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 ${
                            !sidebarOpen && !isSearchFocused && !searchQuery
                                ? "cursor-pointer"
                                : "cursor-text bg-gray-50/50"
                        } ${
                            sidebarOpen || isSearchFocused || searchQuery
                                ? "opacity-100 w-full"
                                : "opacity-0 w-0 group-hover:w-full group-hover:opacity-100 group-hover:bg-white group-hover:pl-10"
                        }`}
                        placeholder={
                            sidebarOpen || isSearchFocused ? "Cari tim..." : ""
                        }
                    />
                    
                    {!isSearchFocused && !searchQuery && !sidebarOpen && (
                        <span className="absolute left-12 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Cari...
                        </span>
                    )}

                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div
                    className={`flex flex-col gap-1 transition-all duration-300 ease-in-out px-3 ${
                        isSearchFocused || searchQuery
                            ? "max-h-[500px] opacity-100 mt-2"
                            : "max-h-0 opacity-0 overflow-hidden group-hover:max-h-[500px] group-hover:opacity-100 group-hover:mt-2" 
                    }`}
                >
                    {searchQuery &&
                        filteredProyekTim.length === 0 &&
                        filteredTimBiasa.length === 0 && (
                            <div className="text-center text-xs text-gray-500 py-3 italic">
                                Tidak ada hasil
                            </div>
                        )}

                    {(!searchQuery || filteredProyekTim.length > 0) && (
                        <div className="flex flex-col">
                            <div
                                onClick={() =>
                                    setDropwdownProyek(!dropdownProyek)
                                }
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FolderKanban size={18} />
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        Proyek{" "}
                                        {searchQuery && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                ({filteredProyekTim.length})
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-200 ${
                                        dropdownProyek ? "rotate-90" : ""
                                    }`}
                                />
                            </div>
                            {dropdownProyek && (
                                <div className="pl-4 pr-1 mt-1 pb-2">
                                    <ul className="relative border-l border-gray-200 ml-2.5">
                                        {filteredProyekTim.map((tim) => (
                                            <li
                                                key={tim.id}
                                                onClick={() =>
                                                    router.visit(
                                                        route("proyek", {
                                                            id: id,
                                                            id_tim: tim.id,
                                                            id_board:
                                                                tim.board_tim
                                                                    ?.id,
                                                        })
                                                    )
                                                }
                                                className="group/item relative pl-6 py-2 cursor-pointer rounded-r-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-200 group-hover/item:bg-gray-300"></span>
                                                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-gray-300 bg-white group-hover/item:border-blue-400 group-hover/item:bg-blue-400 transition-colors"></span>
                                                <div className="flex items-center gap-2 text-gray-600 group-hover/item:text-gray-900">
                                                    <span className="text-sm truncate w-full block">
                                                        {highlightText(
                                                            tim.nama_tim,
                                                            searchQuery
                                                        )}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {(!searchQuery || filteredTimBiasa.length > 0) && (
                        <div className="flex flex-col mt-1">
                            <div
                                onClick={() => setDropdownTim(!dropdownTim)}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Users size={18} />
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        Tim{" "}
                                        {searchQuery && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                ({filteredTimBiasa.length})
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-200 ${
                                        dropdownTim ? "rotate-90" : ""
                                    }`}
                                />
                            </div>
                            {dropdownTim && (
                                <div className="pl-4 pr-1 mt-1 pb-2">
                                    <ul className="relative border-l border-gray-200 ml-2.5">
                                        {filteredTimBiasa.map((anggota) => (
                                            <li
                                                key={anggota.id}
                                                onClick={() =>
                                                    router.visit(
                                                        route("proyek", {
                                                            id: id,
                                                            id_tim: anggota.id,
                                                            id_board:
                                                                anggota
                                                                    .board_tim
                                                                    ?.id,
                                                        })
                                                    )
                                                }
                                                className="group/item relative pl-6 py-2 cursor-pointer rounded-r-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-200 group-hover/item:bg-gray-300"></span>
                                                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-gray-300 bg-white group-hover/item:border-green-400 group-hover/item:bg-green-400 transition-colors"></span>
                                                <div className="flex items-center gap-2 text-gray-600 group-hover/item:text-gray-900">
                                                    <span className="text-sm truncate w-full block">
                                                        {highlightText(
                                                            anggota.nama_tim,
                                                            searchQuery
                                                        )}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-6">
                {role !== "Member" && (
                    <>
                        <MenuItem
                            icon={ShieldCheck}
                            label="Akses Tim"
                            active={activePage === "DashboardAksesTim"}
                            onClick={() => router.visit(route("aksestim", { id }))}
                        />
                        <MenuItem
                            icon={Settings}
                            label="Pengaturan"
                            active={activePage === "DashboardPengaturan"}
                            onClick={() => router.visit(route("pengaturan", { id }))}
                        />
                        <MenuItem
                            icon={Medal}
                            label="Leaderboard"
                            active={activePage === "DashboardLeaderboard"}
                            onClick={() => router.visit(route("leaderboard", { id }))}
                        />
                    </>
                )}
            </div>

            <div
                className={`mt-auto pt-4 border-t border-gray-100 px-4 transition-all duration-500 ease-in-out ${
                    sidebarOpen
                        ? "opacity-100 translate-y-0 max-h-24"
                        : "opacity-0 translate-y-4 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-24"
                }`}
            >
                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
                    Horizon University Indonesia
                </p>
                <p className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                    &copy; {new Date().getFullYear()} All rights reserved.
                </p>
            </div>
        </div>
    );
}