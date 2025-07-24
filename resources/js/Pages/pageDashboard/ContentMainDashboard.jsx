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
    const { activePage } = usePage().props;

    // Dasboard state
    const { setActivePage } = DashboardState();

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
                <div
                    className="mt-10 flex flex-col justify-center items-center gap-2 cursor-pointer"
                    onClick={() => setBuatTimModal(true)}
                >
                    <h1 className="text-xl text-gray-400">Buat grup</h1>
                    <PlusCircle className="w-10 h-10 text-gray-400" />
                </div>

                {/* card grup */}
                <div className="w-full">
                    {/* Proyek grup*/}
                    <div className="my-10">
                        <h1 className="mb-4 text-4xl">Proyek</h1>

                        {/* card proyek */}
                        <div
                            className="w-[280px] rounded-md overflow-hidden shadow-lg transition-all ease-in-out duration-300 cursor-pointer"
                            onClick={() => router.visit(route("proyek"))}
                        >
                            <div className="">
                                {/* image */}
                                <div className="h-[80px]">
                                    <img
                                        src="/img/img_proyek.png"
                                        alt="Gambar grup proyek opsional"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="px-4 h-[150px] bg-gray-100 flow-root">
                                    {/* nama proyek */}
                                    <div className="mt-2">
                                        <h1 className="text-2xl">
                                            Nama proyek
                                        </h1>
                                        <p className="text-sm">Deskripsi</p>
                                    </div>

                                    {/* anggota */}
                                    <div className="mt-8 flex">
                                        <div className="w-[30px] h-[30px] rounded-[50%] bg-blue-600 text-white flex items-center justify-center">
                                            <p>S</p>
                                        </div>
                                        <div className="w-[30px] h-[30px] rounded-[50%] bg-cyan-600 text-white flex items-center justify-center">
                                            <p>S</p>
                                        </div>
                                        <div className="w-[30px] h-[30px] rounded-[50%] bg-green-600 text-white flex items-center justify-center">
                                            <p>F</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Anggota
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tim modal */}
            {buatTimModal && (
                <BuatTimModal onClose={() => setBuatTimModal(false)} />
            )}
        </>
    );
}