import BuatTimModal from "@/modal/BuatTimModal";
import { router, usePage } from "@inertiajs/react";
import { ChevronRight, PlusCircle } from "lucide-react";
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
    const anggotaTim = props.anggotaTim;

    const [ dropdownProyek, setDropdownProyek ] = useState(true);
    const [dropdownTim, setDropdownTim] = useState(true);


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
                {role === "Super User" || role === "Admin" || anggotaTim ? (
                    <>
                        <div
                            className="flex mt-1 flex-col justify-center items-center gap-2 cursor-pointer"
                            onClick={() => setBuatTimModal(true)}
                        >
                            <h1 className="text-xl text-gray-400">Buat grup</h1>
                            <PlusCircle className="w-10 h-10 text-gray-400" />
                        </div>

                        <div className="w-full px-10 pb-10">
                            {/* Proyek grup */}
                            {proyekTim.length > 0 && (
                                <div className="my-4 mt-10 w-full rounded-lg border-2 border-gray-200">
                                    <div
                                        onClick={() =>
                                            setDropdownProyek(!dropdownProyek)
                                        }
                                        className="flex cursor-pointer flex-row items-center justify-between gap-10 border-b-2 p-4 bg-gray-200 border-gray-200"
                                    >
                                        <h1 className="text-4xl h-full text-center">
                                            Proyek
                                        </h1>
                                        <ChevronRight
                                            size={30}
                                            className={`transition-transform duration-200 ${
                                                dropdownProyek
                                                    ? "rotate-90"
                                                    : "rotate-0"
                                            }`}
                                        />
                                    </div>
                                    <div
                                        className={`gap-5 ${
                                            dropdownProyek ? "mt-4" : "mt-0"
                                        } flex-wrap overflow-hidden transition-[height,opacity] duration-200 ease-in-out ${
                                            dropdownProyek
                                                ? "max-h-[1000px] opacity-100 mt-4 px-4 flex"
                                                : "max-h-0 opacity-0 mt-0"
                                        }`}
                                    >
                                        {proyekTim.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[280px] rounded-md overflow-hidden transition-all ease-in-out duration-300 cursor-pointer"
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
                                                    <div className="w-[30px] h-[30px] text-xs text-white bg-blue-700 rounded-full flex justify-center items-center">
                                                        {anggotaTim.map(
                                                            (anggota, i) => (
                                                                <div key={i}>
                                                                    <p>
                                                                        {anggota.charAt(
                                                                            0
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Tim biasa */}
                            {timBiasa.length > 0 && (
                                <div className="w-full border-2 border-gray-200 rounded-lg">
                                    <div
                                        onClick={() =>
                                            setDropdownTim(!dropdownTim)
                                        }
                                        className="cursor-pointer flex flex-row items-center justify-between gap-10 p-4 bg-gray-200 border-b-2 border-gray-200"
                                    >
                                        <h1 className="text-4xl">Tim</h1>
                                        <ChevronRight
                                            size={30}
                                            className={`transition-transform duration-200 ${
                                                dropdownTim
                                                    ? "rotate-90"
                                                    : "rotate-0"
                                            }`}
                                        />
                                    </div>
                                    <div
                                        className={`gap-5 ${
                                            dropdownTim ? "mt-4" : "mt-0"
                                        } flex-wrap overflow-hidden transition-[height,opacity] duration-200 ease-in-out ${
                                            dropdownTim
                                                ? "max-h-[1000px] opacity-100 mt-4 px-4 flex"
                                                : "max-h-0 opacity-0 mt-0"
                                        }`}
                                    >
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
                                                    <div className="w-[30px] h-[30px] text-xs text-white bg-blue-700 rounded-full flex justify-center items-center">
                                                        {anggotaTim.map(
                                                            (anggota, i) => (
                                                                <div key={i}>
                                                                    <p>
                                                                        {anggota.charAt(
                                                                            0
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
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