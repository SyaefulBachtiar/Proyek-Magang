
import Dashboard, {DashboardState} from "./Dashboard";
import { AlignEndHorizontal, AppWindow, LayoutList, MessageSquare } from "lucide-react";
import { useState } from "react";
import Kanban from "./pageProyek/Kanban";
import { router, usePage } from "@inertiajs/react";


export default function Proyek({ children, dashboardId, activePage, tim }) {
    const {id_board} = usePage().props;
    return (
        <Dashboard
            header={
                <>
                    {/* Ringkasan */}
                    <div
                        className="bg-[#006F78] text-white px-2 py-1 rounded-md cursor-pointer relative overflow-hidden"
                        onClick={() =>
                            router.visit(
                                route("proyek.ringkas", {
                                    id: dashboardId,
                                    id_tim: tim.id,
                                })
                            )
                        }
                    >
                        <div className="flex items-center gap-2">
                            <AppWindow size={20} />
                            <h1>Ringkasan</h1>
                        </div>
                        <div
                            className={`bg-[#A8E038] h-1 left-0 bottom-0 absolute ${
                                activePage === "ringkasPage" ? "w-full" : "w-0"
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
                                activePage === "tugasPage" ? "w-full" : ""
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
                                activePage === "chatGrupPage" ? "w-full" : ""
                            }`}
                        ></div>
                    </div>
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
                                activePage === "laporanPage" ? "w-full" : ""
                            }`}
                        ></div>
                    </div>
                </>
            }
        >
            <ProyekContent>{children}</ProyekContent>
        </Dashboard>
    );
}

function ProyekContent ({children}) {

    return(
        <>
        {children} 
        </>
    )
}