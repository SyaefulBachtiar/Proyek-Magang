import Dashboard, { DashboardState } from "./Dashboard";
import {
    AlignEndHorizontal,
    AppWindow,
    LayoutList,
    MessageSquare,
    SquareKanban,
    UserRoundPlus,
    Megaphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import Kanban from "./pageProyek/Kanban";
import { router, usePage } from "@inertiajs/react";
import TambahAnggotaBoard from "@/modal/Proyek/TambahAnggotaBoard";

export default function Proyek({ children, dashboardId, activePage, tim }) {
    const { id_board, role, nama_board } = usePage().props;
    const [tambahAnggota, setTambahAnggota] = useState(false);
    const [unreadCount, setUnreadCount] = useState(tim?.unread_messages_count || 0);

    useEffect(() => {
        setUnreadCount(tim?.unread_messages_count || 0);
    }, [tim]);

    useEffect(() => {
        if (!id_board) return;

        const channel = window.Echo.private(`board.${id_board}`);

        channel.listen(".board.updated", (event) => {
            if (event.type === 'chat' && activePage !== 'chatGrupPage') {
                setUnreadCount((prevCount) => prevCount + 1);
            }
        });

        return () => {
            window.Echo.leave(`board.${id_board}`);
        };
    }, [id_board, activePage]);

    return (
        <>
            <Dashboard
                header={
                    <>
                        <div className="w-full flex justify-between items-center border-t-2 py-2 pt-3">
                            <div className="pl-3 flex-shrink-0">
                                <div className="flex gap-2 items-center">
                                    <SquareKanban
                                        size={20}
                                        className="md:size-25"
                                    />
                                    <h1 className="text-lg md:text-xl font-semibold truncate max-w-80">
                                        {nama_board}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex gap-2 px-3 sm:px-0 overflow-x-auto pb-2 -mb-2 sm:overflow-x-visible sm:pb-0 sm:-mb-0">
                                <div
                                    className="bg-[#006F78] text-white p-2 md:px-3 md:py-1.5 rounded-md cursor-pointer relative overflow-hidden flex-shrink-0"
                                    onClick={() =>
                                        router.visit(
                                            route("proyek.kelolatim", {
                                                id: dashboardId,
                                                id_tim: tim.id,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <AppWindow size={20} />
                                        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                                            Anggota Tim
                                        </span>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute ${
                                            activePage === "kelolatimPage"
                                                ? "w-full"
                                                : "w-0"
                                        }`}
                                    ></div>
                                </div>
                                <div
                                    className="bg-[#006F78] text-white p-2 md:px-3 md:py-1.5 rounded-md cursor-pointer relative overflow-hidden flex-shrink-0"
                                    onClick={() =>
                                        router.visit(
                                            route("proyek", {
                                                id: dashboardId,
                                                id_tim: tim.id,
                                                id_board: id_board,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <LayoutList size={20} />
                                        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                                            Tugas
                                        </span>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute ${
                                            activePage === "tugasPage"
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>
                                <div
                                    className="bg-[#006F78] text-white p-2 md:px-3 md:py-1.5 rounded-md cursor-pointer relative overflow-visible flex-shrink-0 group transition-all duration-200 hover:bg-[#005f66]" // Tambahkan overflow-visible dan hover effect
                                    onClick={() =>
                                        router.visit(
                                            route("proyek.chatgrup", {
                                                id: dashboardId,
                                                id_tim: tim.id,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2 relative">
                                        <MessageSquare size={20} />
                                        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                                            Chat grup
                                        </span>
                                        
                                        {/* --- BAGIAN NOTIFIKASI MODERN --- */}
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-3 -right-3 md:-top-3 md:-right-4 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-[#006F78] transition-transform duration-300 animate-in zoom-in">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                        {/* ------------------------------- */}
                                    </div>
                                    
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute transition-all duration-300 ${
                                            activePage === "chatGrupPage"
                                                ? "w-full"
                                                : "w-0 group-hover:w-full" // Efek hover garis bawah
                                        }`}
                                    ></div>
                                </div>
                                <div
                                    className="bg-[#006F78] text-white p-2 md:px-3 md:py-1.5 rounded-md cursor-pointer relative overflow-hidden flex-shrink-0"
                                    onClick={() =>
                                        router.visit(
                                            route("proyek.pengumuman", {
                                                id: dashboardId,
                                                id_tim: tim.id,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <Megaphone size={20} />
                                        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                                            Pengumuman
                                        </span>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute ${
                                            activePage === "pengumumanPage"
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>

                                <div
                                    className="bg-[#006F78] text-white p-2 md:px-3 md:py-1.5 rounded-md cursor-pointer relative overflow-hidden flex-shrink-0"
                                    onClick={() =>
                                        router.visit(
                                            route("proyek.laporan", {
                                                id: dashboardId,
                                                id_tim: tim.id,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <AlignEndHorizontal size={20} />
                                        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                                            Laporan
                                        </span>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute ${
                                            activePage === "laporanPage"
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>
                                {role !== "Member" ? (
                                    <div
                                        className="bg-[#006F78] text-white p-2 md:px-3 md:py-1.5 rounded-md cursor-pointer relative overflow-hidden flex-shrink-0"
                                        onClick={() =>
                                            setTambahAnggota(!tambahAnggota)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserRoundPlus size={20} />
                                            <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                                                Tambah
                                            </span>
                                        </div>
                                        <div
                                            className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute`}
                                        ></div>
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    </>
                }
            >
                <ProyekContent>{children}</ProyekContent>
            </Dashboard>

            {tambahAnggota && (
                <TambahAnggotaBoard close={() => setTambahAnggota(false)} />
            )}
        </>
    );
}

function ProyekContent({ children }) {
    return <>{children}</>;
}