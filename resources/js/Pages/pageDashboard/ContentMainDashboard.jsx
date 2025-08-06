import BuatTimModal from "@/modal/BuatTimModal";
import { router, usePage } from "@inertiajs/react";
import { ChevronRight, EllipsisVertical, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Dashboard, { DashboardState } from "../Dashboard";



export default function ContentMainDashboard() {
    return (
        <>
            <Dashboard>
                <MainDashboard />
            </Dashboard>
        </>
    );
}

function MainDashboard() {
    // Props dari controller
    const { props } = usePage();
    const activePage = props.activePage;
    const role = props.role;
    const data = props.data;

    const [dropdownProyek, setDropdownProyek] = useState(true);
    const [dropdownTim, setDropdownTim] = useState(true);
    // Ubah state elipsis untuk menyimpan ID tim yang aktif
    const [activeEllipsisId, setActiveEllipsisId] = useState(null);

    const proyekTim = data?.filter((tim) => tim.jenis_tim === "proyek") || [];
    const timBiasa = data?.filter((tim) => tim.jenis_tim === "tim") || [];

    // Dasboard state
    const { setActivePage, id } = DashboardState();

    // state untuk modal buat tim
    const [buatTimModal, setBuatTimModal] = useState(false);

    // Function untuk toggle ellipsis dropdown
    const toggleEllipsis = (timId) => {
        setActiveEllipsisId(activeEllipsisId === timId ? null : timId);
    };



    // Function untuk close dropdown ketika click di luar
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveEllipsisId(null);
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        if (activePage && setActivePage) {
            setActivePage(activePage);
        }
    }, [activePage]);

    return (
        <>
            <div className="flex flex-col justify-center items-center ">
                {/* buat grup */}
                {role === "Super User" || role === "Admin" ? (
                    <div
                        className="flex mt-10 p-2 rounded-lg bg-blue-600 text-white justify-center items-center gap-2 cursor-pointer"
                        onClick={() => setBuatTimModal(true)}
                    >
                        <h1 className="text-xl">Buat grup</h1>
                        <PlusCircle size={18} />
                    </div>
                ) : (
                    ""
                )}
                {data.length > 0 ? (
                    <div className="flex flex-col justify-center items-center w-full mt-10">
                        <div className="w-full px-4 sm:px-2 md:px-2 xl:px-10 pb-10">
                            {/* Proyek grup */}
                            {proyekTim.length > 0 && (
                                <div className="my-4 w-full rounded-lg border-2 border-gray-200">
                                    <div
                                        onClick={() =>
                                            setDropdownProyek(!dropdownProyek)
                                        }
                                        className="flex cursor-pointer flex-row items-center justify-between border-b-2 p-4 bg-gray-200 border-gray-200"
                                    >
                                        <h1 className="h-full text-center sm:text-md text-2xl md:text-xl lg:text-xl xl:text-2xl">
                                            Proyek
                                        </h1>
                                        <ChevronRight
                                            size={30}
                                            className={`transition-transform duration-200 flex-shrink-0 ${
                                                dropdownProyek
                                                    ? "rotate-90"
                                                    : "rotate-0"
                                            }`}
                                        />
                                    </div>
                                    <div
                                        className={`gap-5 flex-wrap overflow-hidden transition-[height,opacity] duration-200 ease-in-out relative ${
                                            dropdownProyek
                                                ? "max-h-[1000px] opacity-100 px-4 p-5 flex"
                                                : "max-h-0 opacity-0 mt-0"
                                        }`}
                                    >
                                        {proyekTim.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[280px] transition-all ease-in-out duration-300 cursor-pointer hover:shadow-lg group shadow-md relative"
                                            >
                                                {/* dropdown elipsis - hanya muncul untuk tim dengan ID yang sesuai */}
                                                {activeEllipsisId ===
                                                    tim.id && (
                                                    <div className="absolute left-72 z-50 top-8 bg-white shadow-lg rounded-md p-2 min-w-[120px]">
                                                        <ul className="space-y-2">
                                                            <li
                                                                className="cursor-pointer text-gray-700 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setActiveEllipsisId(
                                                                        null
                                                                    );
                                                                }}
                                                            >
                                                                Edit
                                                            </li>
                                                            <li
                                                                className="cursor-pointer text-red-600 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setActiveEllipsisId(
                                                                        null
                                                                    );
                                                                    if (
                                                                        confirm(
                                                                            "Apakah Anda yakin ingin menghapus tim ini?"
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            route(
                                                                                "tim-perusahaan.destroy",
                                                                                {
                                                                                    id: id,
                                                                                    id_tim: tim.id,
                                                                                }
                                                                            ),
                                                                            {
                                                                                preserveScroll: true,
                                                                                onSuccess:
                                                                                    () => {
                                                                                        console.log(
                                                                                            "Tim berhasil dihapus"
                                                                                        );
                                                                                    },
                                                                                onError:
                                                                                    (
                                                                                        errors
                                                                                    ) => {
                                                                                        console.log(
                                                                                            "Error:",
                                                                                            errors
                                                                                        );
                                                                                    },
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                Hapus
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="rounded-md overflow-hidden">
                                                    <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded-md bg-white">
                                                        <EllipsisVertical
                                                            size={18}
                                                            className="text-gray-500 hover:text-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleEllipsis(
                                                                    tim.id
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    {/* Overlay gelap saat hover */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10 pointer-events-none"></div>
                                                    <div className="h-[80px] relative">
                                                        <img
                                                            src="/img/img_proyek.png"
                                                            alt="Gambar grup proyek opsional"
                                                            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                                                        />
                                                        {/* Inset shadow pada gambar */}
                                                        <div className="absolute inset-0 shadow-none group-hover:shadow-inset-lg transition-shadow duration-300"></div>
                                                    </div>
                                                    <div className="px-4 h-[150px] bg-gray-100 flow-root">
                                                        <div className="mt-2">
                                                            <h1
                                                                onClick={() =>
                                                                    router.visit(
                                                                        route(
                                                                            "proyek",
                                                                            {
                                                                                id: id,
                                                                                id_tim: tim.id,
                                                                            }
                                                                        )
                                                                    )
                                                                }
                                                                className="text-2xl text-gray-700 hover:underline cursor-pointer"
                                                            >
                                                                {tim.nama_tim}
                                                            </h1>
                                                            <p className="text-sm text-gray-400">
                                                                {
                                                                    tim.deskripsi_tim
                                                                }
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mt-6">
                                                            Anggota
                                                        </p>
                                                        <div className="flex -space-x-2 relative">
                                                            {tim.anggota_tim_perusahaan
                                                                .slice(0, 4)
                                                                .map(
                                                                    (
                                                                        anggota,
                                                                        i
                                                                    ) => {
                                                                        // Warna acak untuk setiap lingkaran
                                                                        const randomColor = `hsl(${Math.floor(
                                                                            Math.random() *
                                                                                360
                                                                        )}, 70%, 50%)`;

                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="w-[30px] h-[30px] text-xs text-white rounded-full flex justify-center items-center"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        randomColor,
                                                                                }}
                                                                                title={
                                                                                    anggota
                                                                                        .user
                                                                                        ?.name
                                                                                }
                                                                            >
                                                                                {anggota.user?.name?.charAt(
                                                                                    0
                                                                                ) ??
                                                                                    "?"}
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}

                                                            {tim
                                                                .anggota_tim_perusahaan
                                                                .length > 4 && (
                                                                <div className="w-[30px] h-[30px] text-xs text-white bg-gray-500 rounded-full flex justify-center items-center">
                                                                    +
                                                                    {tim
                                                                        .anggota_tim_perusahaan
                                                                        .length -
                                                                        4}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Tim biasa */}
                            {timBiasa.length > 0 && (
                                <div className="my-4 w-full border-2 border-gray-200 rounded-lg">
                                    <div
                                        onClick={() =>
                                            setDropdownTim(!dropdownTim)
                                        }
                                        className="cursor-pointer flex flex-row items-center justify-between gap-10 p-4 bg-gray-200 border-b-2 border-gray-200"
                                    >
                                        <h1 className="sm:text-md text-2xl md:text-xl lg:text-xl xl:text-2xl">
                                            Tim
                                        </h1>
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
                                        className={`gap-5 flex-wrap overflow-hidden transition-[height,opacity] duration-200 ease-in-out ${
                                            dropdownTim
                                                ? "max-h-[1000px] opacity-100 px-4 py-5 flex"
                                                : "max-h-0 opacity-0 mt-0"
                                        }`}
                                    >
                                        {timBiasa.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[280px] shadow-lg transition-all ease-in-out duration-300 cursor-pointer hover:shadow-lg group relative"
                                            >
                                                {/* dropdown elipsis untuk tim biasa */}
                                                {activeEllipsisId ===
                                                    tim.id && (
                                                    <div className="absolute left-72 z-50 top-8 bg-white shadow-lg rounded-md p-2 min-w-[120px]">
                                                        <ul className="space-y-2">
                                                            <li
                                                                className="cursor-pointer text-gray-700 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    console.log(
                                                                        "Edit tim:",
                                                                        tim.id
                                                                    );
                                                                    setActiveEllipsisId(
                                                                        null
                                                                    );
                                                                }}
                                                            >
                                                                Edit
                                                            </li>
                                                            <li
                                                                className="cursor-pointer text-red-600 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();

                                                                    // Tambahkan konfirmasi
                                                                    if (
                                                                        confirm(
                                                                            "Apakah Anda yakin ingin menghapus tim ini?"
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            route(
                                                                                "tim-perusahaan.destroy",
                                                                                {
                                                                                    id: id,
                                                                                    id_tim: tim.id,
                                                                                }
                                                                            ),
                                                                            {
                                                                                preserveScroll: true,
                                                                                onSuccess:
                                                                                    () => {
                                                                                        console.log(
                                                                                            "Tim berhasil dihapus"
                                                                                        );
                                                                                    },
                                                                                onError:
                                                                                    (
                                                                                        errors
                                                                                    ) => {
                                                                                        console.log(
                                                                                            "Error:",
                                                                                            errors
                                                                                        );
                                                                                    },
                                                                            }
                                                                        );
                                                                    }

                                                                    setActiveEllipsisId(
                                                                        null
                                                                    );
                                                                }}
                                                            >
                                                                Hapus
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="rounded-md overflow-hidden">
                                                    <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded-md bg-white">
                                                        <EllipsisVertical
                                                            size={18}
                                                            className="text-gray-500 hover:text-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleEllipsis(
                                                                    tim.id
                                                                );
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        {/* Overlay gelap saat hover */}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10 pointer-events-none"></div>
                                                        <div className="h-[80px] relative">
                                                            <img
                                                                src="/img/img_proyek.png"
                                                                alt="Gambar grup tim opsional"
                                                                className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                                                            />
                                                            {/* Overlay gelap saat hover */}
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10 pointer-events-none"></div>
                                                        </div>
                                                        <div className="px-4 h-[150px] bg-gray-100 flow-root">
                                                            <div className="mt-2">
                                                                <h1
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            route(
                                                                                "proyek",
                                                                                {
                                                                                    id: id,
                                                                                    id_tim: tim.id,
                                                                                }
                                                                            )
                                                                        )
                                                                    }
                                                                    className="text-2xl text-gray-700 hover:underline"
                                                                >
                                                                    {
                                                                        tim.nama_tim
                                                                    }
                                                                </h1>
                                                                <p className="text-sm text-gray-400">
                                                                    {
                                                                        tim.deskripsi_tim
                                                                    }
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-gray-400 mt-6">
                                                                Anggota
                                                            </p>
                                                            <div className="flex -space-x-2">
                                                                {tim.anggota_tim_perusahaan
                                                                    .slice(0, 4)
                                                                    .map(
                                                                        (
                                                                            anggota,
                                                                            i
                                                                        ) => {
                                                                            // Warna acak untuk setiap lingkaran
                                                                            const randomColor = `hsl(${Math.floor(
                                                                                Math.random() *
                                                                                    360
                                                                            )}, 70%, 50%)`;

                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className="w-[30px] h-[30px] text-xs text-white rounded-full flex justify-center items-center"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            randomColor,
                                                                                    }}
                                                                                    title={
                                                                                        anggota
                                                                                            .user
                                                                                            ?.name
                                                                                    }
                                                                                >
                                                                                    {anggota.user?.name?.charAt(
                                                                                        0
                                                                                    ) ??
                                                                                        "?"}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}

                                                                {tim
                                                                    .anggota_tim_perusahaan
                                                                    .length >
                                                                    4 && (
                                                                    <div className="w-[30px] h-[30px] text-xs text-white bg-gray-500 rounded-full flex justify-center items-center">
                                                                        +
                                                                        {tim
                                                                            .anggota_tim_perusahaan
                                                                            .length -
                                                                            4}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
