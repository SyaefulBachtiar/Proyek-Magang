import BuatTimModal from "@/modal/BuatTimModal";
import { router, usePage } from "@inertiajs/react";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Dashboard, {DashboardState} from "../Dashboard";

export default function ContentMainDashboard () {
   return(
    <>
    <Dashboard>
        <MainDashboard />
    </Dashboard>
    </>
   )
}

function MainDashboard () {

    // Props dari controller 
    const { props } = usePage();
    const activePage = props.activePage;
    const role = props.role;
    const data = props.data;

    const proyekTim = data?.filter((tim) => tim.jenis_tim === "proyek") || [];
    const timBiasa = data?.filter((tim) => tim.jenis_tim === "tim") || [];



    // Dasboard state
    const { setActivePage, id } = DashboardState();

    // state untuk modal buat tim
    const [buatTimModal, setBuatTimModal] = useState(false);

    useEffect(() => {
        if(activePage && setActivePage){
            setActivePage(activePage);
        }
    }, [activePage]);

    return (
        <>
            <div className="flex flex-col justify-center items-center px-5">
                {/* buat grup */}
                {role === "Super User" || role === "Admin" ? (
                    <>
                        <div
                            className="mt-10 flex flex-col justify-center items-center gap-2 cursor-pointer"
                            onClick={() => setBuatTimModal(true)}
                        >
                            <h1 className="text-xl text-gray-400">Buat grup</h1>
                            <PlusCircle className="w-10 h-10 text-gray-400" />
                        </div>

                        <div className="w-full">
                            {/* Proyek grup*/}
                            {proyekTim.length > 0 && (
                                <div className="my-10 w-full">
                                    <h1 className="mb-4 text-4xl">Proyek</h1>
                                    <div className="flex gap-5 flex-wrap">
                                        {proyekTim.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[280px] rounded-md overflow-hidden shadow-lg transition-all ease-in-out duration-300 cursor-pointer"
                                                onClick={() =>
                                                    router.visit(
                                                        route("proyek", {
                                                            id: id,
                                                            id_tim: tim.id,
                                                        })
                                                    )
                                                }
                                            >
                                                <div className="h-[80px]">
                                                    <img
                                                        src="/img/img_proyek.png"
                                                        alt="Gambar grup proyek opsional"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="px-4 h-[150px] bg-gray-100 flow-root">
                                                    <div className="mt-2">
                                                        <h1 className="text-2xl">
                                                            {tim.nama_tim}
                                                        </h1>
                                                        <p className="text-sm">
                                                            {tim.deskripsi_tim}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mt-6">
                                                        Anggota
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Tim biasa */}
                            {timBiasa.length > 0 && (
                                <div className="my-10 w-full">
                                    <h1 className="mb-4 text-4xl">Tim</h1>
                                    <div className="flex gap-5 flex-wrap">
                                        {timBiasa.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[280px] rounded-md overflow-hidden shadow-lg transition-all ease-in-out duration-300 cursor-pointer"
                                                onClick={() =>
                                                    router.visit(
                                                        route("proyek", {
                                                            id: id,
                                                            id_tim: tim.id,
                                                        })
                                                    )
                                                }
                                            >
                                                <div className="h-[80px]">
                                                    <img
                                                        src="/img/img_proyek.png"
                                                        alt="Gambar grup tim opsional"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="px-4 h-[150px] bg-gray-100 flow-root">
                                                    <div className="mt-2">
                                                        <h1 className="text-2xl">
                                                            {tim.nama_tim}
                                                        </h1>
                                                        <p className="text-sm">
                                                            {tim.deskripsi_tim}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mt-6">
                                                        Anggota
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    ""
                )}
            </div>

            {/* Tim modal */}
            {buatTimModal && (
                <BuatTimModal onClose={() => setBuatTimModal(false)} />
            )}
        </>
    );
}