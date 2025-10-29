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
import { useState } from "react";
import Kanban from "./pageProyek/Kanban";
import { router, usePage } from "@inertiajs/react";
import TambahAnggotaBoard from "@/modal/Proyek/TambahAnggotaBoard";

export default function Proyek({ children, dashboardId, activePage, tim }) {
    const { id_board, role, nama_board } = usePage().props;
    const [tambahAnggota, setTambahAnggota] = useState(false);
    return (
        <>
            <Dashboard
                header={
                    <>
                        <div className="w-full flex justify-between border-t-2 py-2 pt-3">
                            <div className="">
                                <div className="ml-[10px] flex gap-2 items-center">
                                    <SquareKanban size={25} />
                                    <h1 className="text-xl font-semibold">
                                        {nama_board}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* Kelola Tim */}
                                <div
                                    className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
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
                                        <h1>Anggota Tim</h1>
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
                                    className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
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
                                        <h1>Tugas</h1>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 absolute ${
                                            activePage === "tugasPage"
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>
                                <div
                                    className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
                                    onClick={() =>
                                        router.visit(
                                            route("proyek.chatgrup", {
                                                id: dashboardId,
                                                id_tim: tim.id,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={20} />
                                        <h1>Chat grup</h1>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 absolute ${
                                            activePage === "chatGrupPage"
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>
                                <div
                                    className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
                                    onClick={() =>
                                        router.visit(
                                            route("proyek.pengumuman", { // <-- 2. Arahkan ke route baru
                                                id: dashboardId,
                                                id_tim: tim.id,
                                            })
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <Megaphone size={20} /> {/* <-- 3. Gunakan ikon baru */}
                                        <h1>Pengumuman</h1>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 absolute ${
                                            activePage === "pengumumanPage" // <-- 4. Kondisi untuk underline aktif
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>
                                {/* ===== AKHIR BLOK KODE BARU ===== */}
                                
                                <div
                                    className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
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
                                        <h1>Laporan</h1>
                                    </div>
                                    <div
                                        className={`bg-[#A8E038] h-1 left-0 absolute ${
                                            activePage === "laporanPage"
                                                ? "w-full"
                                                : ""
                                        }`}
                                    ></div>
                                </div>
                                {role !== "Member" ? (
                                    <div
                                        className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
                                        onClick={() =>
                                            setTambahAnggota(!tambahAnggota)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserRoundPlus size={20} />
                                            <h1>Tambah</h1>
                                        </div>
                                        <div
                                            className={`bg-[#A8E038] h-1 left-0 absolute`}
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