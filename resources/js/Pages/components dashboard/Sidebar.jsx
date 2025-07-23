import { House, ListFilterIcon, Search, Settings, ShieldCheck } from "lucide-react";

export default function Sidebar ({sidebarOpen, activePage, setActivePage}) {
    return (
        <>
            <div className="w-full flex flex-col justify-end my-10 rounded-lg gap-6">
                {/* Home sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                        activePage === "DashboardMain" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => setActivePage("DashboardMain")}
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
                        <p className="group-hover:hidden">Cari</p>
                        <div className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100">
                            <ListFilterIcon className="w-5 h-5" />
                        </div>
                    </div>

                    {/* hasil search */}
                    <div className="bg-white w-full overflow-hidden h-0 group-hover:h-[300px] group-hover:mt-4 group-hover:p-2 transition-all ease-in-out duration-300">
                        <p>Memuncul kan hasil</p>
                    </div>
                </div>

                {/* akses tim sidebar */}
                <div
                    className={`w-full group cursor-pointer rounded-md hover:bg-gray-200 ${
                        activePage === "DashboardAksesTim" ? "bg-gray-200" : ""
                    }`}
                    onClick={() => setActivePage("DashboardAksesTim")}
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
                    onClick={() => setActivePage("DashboardPengaturan")}
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
            </div>
        </>
    );
}