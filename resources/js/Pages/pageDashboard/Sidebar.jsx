import { router, usePage } from "@inertiajs/react";
import { ChevronRight, FolderKanban, House, ListFilterIcon, Search, Settings, ShieldCheck, UserRound, Medal, FolderOpenDot, Users } from "lucide-react";
import { useState } from "react";

export default function Sidebar ({sidebarOpen, activePage, id}) {

    const { timPerusahaan } = usePage().props;
    
    const proyekTim = timPerusahaan?.filter((tim) => tim.jenis_tim === "proyek") || [];
    const timBiasa = timPerusahaan?.filter((tim) => tim.jenis_tim === "tim") || [];

    const [dropdownProyek, setDropwdownProyek ] = useState(false);
    const [dropdownTim, setDropdownTim] = useState(false);
    
    return (
        <>
            <div className="w-full flex flex-col justify-end my-10 rounded-lg gap-6">
                {/* Home sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                        activePage === "DashboardMain" ? "bg-gray-200" : ""
                    }`}
                    onClick={() =>
                        router.visit(route("dashboard.with.id", { id }))
                    }
                >
                    <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                        <div
                            className={`border px-[5px] rounded-lg h-[42px] border-gray-300 flex items-center`}
                        >
                            <div className="w-8 h-8 flex justify-center items-center">
                                <House
                                    className={`w-6 h-6 flex-shrink-0 ${
                                        activePage === "DashboardMain"
                                            ? "text-black"
                                            : "text-gray-400"
                                    }`}
                                />
                            </div>
                        </div>
                        <p className="w-[80px] flex-shrink-0">Dashboard</p>
                    </div>
                </div>

                {/* search sidebar */}
                <div className="w-full group cursor-pointer">
                    <div className="w-full group flex overflow-hidden gap-4 relative items-center">
                        <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            className={`pr-4 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:ring-gray-400 transition-all delay-150 ease-in-out duration-500 group-hover:pl-10 group-hover:w-full ${
                                sidebarOpen ? "w-0 pl-6" : "w-0 pl-6"
                            }`}
                            placeholder="Cari..."
                        />
                        <p className="group-hover:hidden transition-all delay-150 ease-in-out duration-300">
                            Cari
                        </p>
                        <div className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100">
                            <ListFilterIcon className="w-5 h-5" />
                        </div>
                    </div>

                    {/* hasil search */}
                    <div className="w-full overflow-hidden h-0 group-hover:h-[300px] group-hover:mt-4 group-hover:p-2 transition-all delay-150 ease-in-out duration-300 flex flex-col gap-2">
                        <div className="group/chevron hover:bg-gray-200 py-2 px-1 rounded-md">
                            <div
                                onClick={() =>
                                    setDropwdownProyek(!dropdownProyek)
                                }
                                className="flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <FolderKanban />
                                    <h1>Proyek</h1>
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

                                        {proyekTim.map((tim, index) => (
                                            <li
                                                key={tim.id}
                                                className="relative rounded-md py-2 hover:bg-white m-2 flex items-center gap-2 pl-4"
                                            >
                                                {/* Garis horizontal untuk setiap item */}
                                                <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-400 -translate-y-1/2"></div>

                                                {/* Titik konektor */}
                                                <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full -translate-y-1/2 -translate-x-1/2"></div>

                                                {/* Garis vertikal terputus untuk item terakhir */}
                                                {index ===
                                                    timPerusahaan.length -
                                                        1 && (
                                                    <div className="absolute left-0 top-1/2 bottom-0 w-px bg-white"></div>
                                                )}

                                                <FolderOpenDot className="text-blue-500" />
                                                <p className="text-sm">
                                                    {tim.nama_tim}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="group/chevron hover:bg-gray-200 py-2 px-1 rounded-md">
                            <div
                                onClick={() => setDropdownTim(!dropdownTim)}
                                className="flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <Users />
                                    <h1>Tim</h1>
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

                                        {timBiasa.map((anggota, index) => (
                                            <li
                                                key={anggota.id}
                                                className="relative rounded-md hover:bg-white m-2 flex items-center gap-2 pl-4 py-2"
                                            >
                                                {/* Garis horizontal untuk setiap item */}
                                                <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-400 -translate-y-1/2"></div>

                                                {/* Titik konektor */}
                                                <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full -translate-y-1/2 -translate-x-1/2"></div>

                                                {/* Garis vertikal terputus untuk item terakhir */}
                                                {index ===
                                                    timPerusahaan.length -
                                                        1 && (
                                                    <div className="absolute left-0 top-1/2 bottom-0 w-px bg-white"></div>
                                                )}

                                                <FolderOpenDot className="text-green-500" />
                                                <p className="text-sm">
                                                    {anggota.nama_tim}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* akses tim sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                        activePage === "DashboardAksesTim" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => router.visit(route("aksestim", { id }))}
                >
                    <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                        <div
                            className={`border px-[5px] rounded-lg h-[42px] border-gray-300 flex items-center`}
                        >
                            <div className="w-8 h-8 flex justify-center items-center">
                                <ShieldCheck
                                    className={`w-6 h-6 flex-shrink-0 ${
                                        activePage === "DashboardAksesTim"
                                            ? "text-black"
                                            : "text-gray-400"
                                    }`}
                                />
                            </div>
                        </div>
                        <p className="w-[80px] flex-shrink-0">Akses Tim</p>
                    </div>
                </div>

                {/* Pengaturan sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                        activePage === "DashboardPengaturan"
                            ? "bg-gray-200"
                            : ""
                    }`}
                    onClick={() => router.visit(route("pengaturan", { id }))}
                >
                    <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                        <div
                            className={`border px-[5px] rounded-lg h-[42px] border-gray-300 flex items-center`}
                        >
                            <div className="w-8 h-8 flex justify-center items-center">
                                <Settings
                                    className={`w-6 h-6 flex-shrink-0 ${
                                        activePage === "DashboardPengaturan"
                                            ? "text-black"
                                            : "text-gray-400"
                                    }`}
                                />
                            </div>
                        </div>
                        <p className="w-[80px] flex-shrink-0">Pengaturan</p>
                    </div>
                </div>

                {/* leaderboard sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                        activePage === "DashboardLeaderboard"
                            ? "bg-gray-200"
                            : ""
                    }`}
                    onClick={() => router.visit(route("leaderboard", { id }))}
                >
                    <div className="flex overflow-hidden gap-4 items-center rounded-lg w-full">
                        <div
                            className={`border px-[5px] rounded-lg h-[42px] border-gray-300 flex items-center`}
                        >
                            <div className="w-8 h-8 flex justify-center items-center">
                                <Medal
                                    className={`w-6 h-6 flex-shrink-0 ${
                                        activePage === "DashboardLeaderboard"
                                            ? "text-black"
                                            : "text-gray-400"
                                    }`}
                                />
                            </div>
                        </div>
                        <p className="w-[80px] flex-shrink-0">Leaderboard</p>
                    </div>
                </div>
            </div>
        </>
    );
}