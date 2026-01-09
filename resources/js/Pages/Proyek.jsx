import Dashboard from "./Dashboard";
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
import { router, usePage } from "@inertiajs/react";
import TambahAnggotaBoard from "@/modal/Proyek/TambahAnggotaBoard";

export default function Proyek({ children, dashboardId, activePage, tim }) {
    const { id_board, role, nama_board } = usePage().props;
    const [tambahAnggota, setTambahAnggota] = useState(false);
    
    const [unreadChat, setUnreadChat] = useState(tim?.unread_messages_count || 0);
    const [unreadAnnounce, setUnreadAnnounce] = useState(tim?.unread_announcements_count || 0);

    useEffect(() => {
        setUnreadChat(tim?.unread_messages_count || 0);
        setUnreadAnnounce(tim?.unread_announcements_count || 0);
    }, [tim]);

    useEffect(() => {
        if (!id_board) return;

        const channel = window.Echo.private(`board.${id_board}`);

        channel.listen(".board.updated", (event) => {
            if (event.type === 'chat' && activePage !== 'chatGrupPage') {
                setUnreadChat((prev) => prev + 1);
            }
            if (event.type === 'announcement' && activePage !== 'pengumumanPage') {
                setUnreadAnnounce((prev) => prev + 1);
            }
        });

        return () => {
            window.Echo.leave(`board.${id_board}`);
        };
    }, [id_board, activePage]);

    const NavButton = ({ icon: Icon, label, active, onClick, badgeCount }) => (
        <div
            onClick={onClick}
            className={`
                group relative flex flex-shrink-0 cursor-pointer select-none items-center gap-2
                rounded-md px-3 py-2 transition-all duration-200 overflow-hidden
                bg-[#006F78] text-white hover:bg-[#005f66] active:scale-95
            `}
        >
            <div className="relative flex items-center justify-center">
                <Icon size={20} />
                
                {/* Badge Notifikasi */}
                {badgeCount > 0 && (
    <span className="
        absolute -right-1.5 -top-1.5 
        flex h-4 min-w-[16px] items-center justify-center
        rounded-full bg-rose-500
        px-1 text-[9px] font-semibold text-white
        shadow-md ring-2 ring-white
        transition-all duration-300
        group-hover:scale-110
    ">
        {badgeCount > 99 ? '99+' : badgeCount}
    </span>
)}

            </div>
            
            <span className="hidden whitespace-nowrap text-sm font-medium md:inline">
                {label}
            </span>
            <div
                className={`absolute bottom-0 left-0 h-1 bg-[#A8E038] transition-all duration-300 ease-out ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                }`}
            ></div>
        </div>
    );

    return (
        <>
            <Dashboard
                header={
                    // Sticky Header agar navbar menempel saat di-scroll di mobile
                    <div className="sticky top-0 z-30 w-full border-t border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 py-3 px-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            
                            {/* Judul & Ikon Board */}
                            <div className="flex min-w-0 flex-shrink-0 items-center gap-3 pl-1">
                                <SquareKanban size={24} className="text-[#006F78]" />
                                <h1 className="truncate text-lg font-bold text-gray-800 sm:text-xl md:max-w-md">
                                    {nama_board}
                                </h1>
                            </div>

                            {/* Menu Navigasi Scrollable (Tanpa Scrollbar Kasar) */}
                            <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0 no-scrollbar">
                                <NavButton 
                                    label="Anggota Tim" 
                                    icon={AppWindow} 
                                    active={activePage === "kelolatimPage"}
                                    onClick={() => router.visit(route("proyek.kelolatim", { id: dashboardId, id_tim: tim.id }))}
                                />
                                
                                <NavButton 
                                    label="Tugas" 
                                    icon={LayoutList} 
                                    active={activePage === "tugasPage"}
                                    onClick={() => router.visit(route("proyek", { id: dashboardId, id_tim: tim.id, id_board: id_board }))}
                                />

                                <NavButton 
                                    label="Chat Grup" 
                                    icon={MessageSquare} 
                                    active={activePage === "chatGrupPage"}
                                    badgeCount={unreadChat}
                                    onClick={() => router.visit(route("proyek.chatgrup", { id: dashboardId, id_tim: tim.id }))}
                                />

                                <NavButton 
                                    label="Pengumuman" 
                                    icon={Megaphone} 
                                    active={activePage === "pengumumanPage"}
                                    badgeCount={unreadAnnounce}
                                    onClick={() => router.visit(route("proyek.pengumuman", { id: dashboardId, id_tim: tim.id }))}
                                />

                                <NavButton 
                                    label="Laporan" 
                                    icon={AlignEndHorizontal} 
                                    active={activePage === "laporanPage"}
                                    onClick={() => router.visit(route("proyek.laporan", { id: dashboardId, id_tim: tim.id }))}
                                />

                                {role !== "Member" && (
                                    <NavButton 
                                        label="Tambah" 
                                        icon={UserRoundPlus} 
                                        active={false}
                                        onClick={() => setTambahAnggota(!tambahAnggota)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* CSS Inline untuk menyembunyikan scrollbar di mobile agar rapi */}
                        <style>{`
                            .no-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                            .no-scrollbar {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }
                        `}</style>
                    </div>
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