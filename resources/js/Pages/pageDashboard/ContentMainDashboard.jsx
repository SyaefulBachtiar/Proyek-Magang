import BuatTimModal from "@/modal/BuatTimModal";
import EditTimModal from "@/modal/EditTimModal";

import { router, useForm, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    CheckCircle,
    EllipsisVertical,
    Kanban,
    Loader2,
    Plus,
} from "lucide-react";
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
    const { props } = usePage();
    const activePage = props.activePage;
    const role = props.role;
    const data = props.data;
    const perusahaan = props.perusahaan;

    const [activeEllipsisId, setActiveEllipsisId] = useState(null);

    const proyekTim = data?.filter((tim) => tim.jenis_tim === "proyek") || [];
    const timBiasa = data?.filter((tim) => tim.jenis_tim === "tim") || [];

    const { setActivePage, id } = DashboardState();

    const [buatTimModal, setBuatTimModal] = useState(false);

    const [editTimModal, setEditTimModal] = useState(false);
    const [timToEdit, setTimToEdit] = useState(null);

    const handleEditClick = (tim) => {
        setTimToEdit(tim);
        setEditTimModal(true);
        setActiveEllipsisId(null);
    };

    const toggleEllipsis = (timId) => {
        setActiveEllipsisId(activeEllipsisId === timId ? null : timId);
    };

    useEffect(() => {
        if (id) {
            const channel = window.Echo.private(`user.${id}`);

            channel.listen(".notif.updated", (event) => {
                router.reload({
                    only: ["data", "role", "perusahaan"],
                });
            });

            return () => {
                window.Echo.leave(`user.${id}`);
            };
        }
    }, []);

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

    const {
        data: formData,
        setData,
        put,
        processing,
        errors,
        recentlySuccessful,
        isDirty,
    } = useForm({
        nama_perusahaan: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("perusahaan.update", { id: id }), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Perusahaan berhasil diupdate");
            },
            onError: (errors) => {
                console.log("Error:", errors);
            },
        });
    };

    return (
        <>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {!perusahaan ? (
                    <div className="flex flex-col justify-center items-center w-full min-h-[50vh]">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-100"
                        >
                            <div className="mb-8 flex gap-4 items-center">
                                <div className="h-12 w-12 flex-shrink-0">
                                    <img
                                        src="/img/perusahaan.png"
                                        alt="Perusahaan"
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Masukan Nama Instansi
                                </h2>
                            </div>
                            {recentlySuccessful && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
                                    <CheckCircle size={20} />
                                    <span className="text-sm font-medium">
                                        Instansi berhasil ditambahkan!
                                    </span>
                                </div>
                            )}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    id="nama_perusahaan"
                                    name="nama_perusahaan"
                                    value={formData.nama_perusahaan}
                                    onChange={(e) =>
                                        setData(
                                            "nama_perusahaan",
                                            e.target.value
                                        )
                                    }
                                    className={`w-full py-3 px-4 border rounded-lg text-gray-700 leading-tight focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.nama_perusahaan
                                            ? "border-red-400 focus:ring-red-400 bg-red-50"
                                            : "border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white"
                                    }`}
                                    placeholder="PT. Contoh Perusahaan"
                                    required
                                    disabled={processing}
                                />
                                {errors.nama_perusahaan && (
                                    <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.nama_perusahaan}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-center pt-2">
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !formData.nama_perusahaan.trim() ||
                                        !isDirty
                                    }
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                                        processing ||
                                        !formData.nama_perusahaan.trim() ||
                                        !isDirty
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 active:scale-95"
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Mengupdate...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Buat Instansi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : role === "Super User" || role === "Admin" ? (
                    // BAGIAN TOMBOL BUAT GRUP (DIPASTIKAN DI TENGAH)
                    <div className="flex justify-center mt-8 mb-10">
                        <button
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 group"
                            onClick={() => setBuatTimModal(true)}
                        >
                            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-lg font-bold">
                                Buat grup
                            </span>
                        </button>
                    </div>
                ) : null}

                {data.length > 0 ? (
                    <div className="flex flex-col gap-12 pb-12">
                        {proyekTim.length > 0 && (
                            <div className="w-full">
                                <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                    Proyek
                                </h1>
                                {/* Grid Responsif: 1 kolom di HP, naik jadi 2, 3, dan 4 di layar besar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {proyekTim.map((tim) => (
                                        <div
                                            key={tim.id}
                                            className="group relative w-full bg-[#F0E460] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-visible"
                                        >
                                            {activeEllipsisId === tim.id && (
                                                <div className="absolute right-2 top-10 z-50 bg-white rounded-lg p-1 min-w-[140px] shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5">
                                                    <ul className="flex flex-col">
                                                        <li
                                                            className="cursor-pointer text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-md transition-colors text-sm font-medium"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(
                                                                    tim
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </li>
                                                        <li
                                                            className="cursor-pointer text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-md transition-colors text-sm font-medium"
                                                            onClick={(e) => {
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

                                            <div className="absolute top-2 right-2 z-40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm backdrop-blur-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleEllipsis(tim.id);
                                                    }}
                                                >
                                                    <EllipsisVertical size={18} />
                                                </button>
                                            </div>

                                            <div
                                                onClick={() =>
                                                    router.visit(
                                                        route("proyek", {
                                                            id: id,
                                                            id_tim: tim.id,
                                                            id_board:
                                                                tim.board_tim
                                                                    ?.id,
                                                        })
                                                    )
                                                }
                                                className="cursor-pointer flex flex-col h-full rounded-xl overflow-hidden"
                                            >
                                                {/* Aspect Video menjaga rasio gambar tetap bagus */}
                                                <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                                                    <img
                                                        src={
                                                            tim.image
                                                                ? `/storage/${tim.image}`
                                                                : "/img/kanban.png"
                                                        }
                                                        alt={tim.nama_tim}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                                </div>

                                                <div className="p-4 bg-white flex-1 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Kanban
                                                            size={16}
                                                            className="text-blue-600 flex-shrink-0"
                                                        />
                                                        <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                                            {tim.nama_tim}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {tim.deskripsi_tim ||
                                                            "Tidak ada deskripsi"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {timBiasa.length > 0 && (
                            <div className="w-full">
                                <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                    Tim
                                </h1>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {timBiasa.map((tim) => (
                                        <div
                                            key={tim.id}
                                            className="group relative w-full bg-[#F0E460] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-visible"
                                        >
                                            {activeEllipsisId === tim.id && (
                                                <div className="absolute right-2 top-10 z-50 bg-white rounded-lg p-1 min-w-[140px] shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5">
                                                    <ul className="flex flex-col">
                                                        <li
                                                            className="cursor-pointer text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-md transition-colors text-sm font-medium"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(
                                                                    tim
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </li>
                                                        <li
                                                            className="cursor-pointer text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-md transition-colors text-sm font-medium"
                                                            onClick={(e) => {
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

                                            <div className="absolute top-2 right-2 z-40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm backdrop-blur-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleEllipsis(tim.id);
                                                    }}
                                                >
                                                    <EllipsisVertical size={18} />
                                                </button>
                                            </div>

                                            <div
                                                onClick={() =>
                                                    router.visit(
                                                        route("proyek", {
                                                            id: id,
                                                            id_tim: tim.id,
                                                            id_board:
                                                                tim.board_tim
                                                                    ?.id,
                                                        })
                                                    )
                                                }
                                                className="cursor-pointer flex flex-col h-full rounded-xl overflow-hidden"
                                            >
                                                <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                                                    <img
                                                        src={
                                                            tim.image
                                                                ? `/storage/${tim.image}`
                                                                : "/img/kanban.png"
                                                        }
                                                        alt={tim.nama_tim}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                                </div>

                                                <div className="p-4 bg-white flex-1 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Kanban
                                                            size={16}
                                                            className="text-blue-600 flex-shrink-0"
                                                        />
                                                        <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                                            {tim.nama_tim}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {tim.deskripsi_tim ||
                                                            "Tidak ada deskripsi"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : !perusahaan ? null : (
                    <div className="flex justify-center items-center mt-12 px-4">
                        <div className="w-full max-w-md lg:max-w-lg">
                            <img
                                src="/img/ilustrasi.png"
                                alt="ilustrasi"
                                className="w-full h-auto object-contain drop-shadow-lg"
                            />
                        </div>
                    </div>
                )}
            </div>

            {buatTimModal && (
                <BuatTimModal onClose={() => setBuatTimModal(false)} />
            )}

            {editTimModal && timToEdit && (
                <EditTimModal
                    id_perusahaan={id}
                    tim={timToEdit}
                    onClose={() => {
                        setEditTimModal(false);
                        setTimToEdit(null);
                    }}
                />
            )}
        </>
    );
}