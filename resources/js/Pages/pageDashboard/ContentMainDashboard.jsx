import BuatTimModal from "@/modal/BuatTimModal";
import EditTimModal from "@/modal/EditTimModal"; // Import modal edit

import { router, useForm, usePage } from "@inertiajs/react";
import { AlertCircle, CheckCircle, EllipsisVertical, Loader2, Plus } from "lucide-react";
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
    const perusahaan = props.perusahaan;

    const [activeEllipsisId, setActiveEllipsisId] = useState(null);

    const proyekTim = data?.filter((tim) => tim.jenis_tim === "proyek") || [];
    const timBiasa = data?.filter((tim) => tim.jenis_tim === "tim") || [];

    // Dasboard state, `id` di sini adalah ID Perusahaan
    const { setActivePage, id } = DashboardState();

    // state untuk modal buat tim
    const [buatTimModal, setBuatTimModal] = useState(false);

    // State untuk modal edit tim
    const [editTimModal, setEditTimModal] = useState(false);
    const [timToEdit, setTimToEdit] = useState(null);

    // Fungsi untuk membuka modal edit
    const handleEditClick = (tim) => {
        setTimToEdit(tim);
        setEditTimModal(true);
        setActiveEllipsisId(null);
    };

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

    // useForm untuk form perusahaan (UPDATE)
    const {
        data: formData,
        setData,
        put,
        processing,
        errors,
        recentlySuccessful,
        isDirty,
    } = useForm({
        nama_perusahaan: '',
    });

    // Handle form submission untuk UPDATE perusahaan
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
            <div className="flex flex-col justify-center items-center ">
                {!perusahaan ? (
                    <div className="flex flex-col justify-center items-center w-full mt-10">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full max-w-md bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-100"
                        >
                            <div className="mb-6 flex gap-5 items-end">
                                <div className="h-[40px] w-[40px]">
                                    <img
                                        src="/img/perusahaan.png"
                                        alt="Perusahaan"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Masukan Nama Perusahaan
                                </h2>
                            </div>
                            {recentlySuccessful && (
                                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    <span className="text-sm">
                                        Perusahaan berhasil di tambahkan!
                                    </span>
                                </div>
                            )}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    id="nama_perusahaan"
                                    name="nama_perusahaan"
                                    value={formData.nama_perusahaan}
                                    onChange={(e) => setData("nama_perusahaan", e.target.value)}
                                    className={`w-full py-3 px-4 border rounded-lg text-gray-700 leading-tight focus:outline-none focus:ring-2 transition-all duration-200 ${errors.nama_perusahaan
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
                            <div className="flex items-center justify-center">
                                <button
                                    type="submit"
                                    disabled={processing || !formData.nama_perusahaan.trim() || !isDirty}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${processing || !formData.nama_perusahaan.trim() || !isDirty
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02]"
                                        }`}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Mengupdate...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Buat Perusahaan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : role === "Super User" || role === "Admin" ? (
                    <div
                        className="flex mt-10 p-3 rounded-lg bg-blue-600 text-white justify-center items-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                        onClick={() => setBuatTimModal(true)}
                    >
                        <Plus size={30} />
                        <h1 className="text-2xl">Buat grup</h1>
                    </div>
                ) : (
                    ""
                )}
                {data.length > 0 ? (
                    <div className="flex flex-col justify-center items-center mt-10">
                        <div className="w-full px-4 sm:px-2 md:px-2 xl:px-10 pb-10">
                            {/* Proyek grup */}
                            {proyekTim.length > 0 && (
                                <div className="my-4 w-full rounded-lg">
                                    <div className="mb-5">
                                        <h1 className="text-2xl">Proyek</h1>
                                    </div>
                                    <div className="grid grid-flow-row grid-cols-3 gap-10">
                                        {proyekTim.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[328px] h-[234px] transition-all ease-in-out duration-300 cursor-pointer shadow-[2px_2px_15px_rgba(0,0,0,0.10)] hover:shadow-lg bg-[#F0E460] rounded-xl group relative"
                                            >
                                                {activeEllipsisId === tim.id && (
                                                    <div className="absolute left-72 z-50 top-8 bg-white rounded-md p-2 min-w-[120px]">
                                                        <ul className="space-y-2">
                                                            <li
                                                                className="cursor-pointer text-gray-700 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(tim);
                                                                }}
                                                            >
                                                                Edit
                                                            </li>
                                                            <li
                                                                className="cursor-pointer text-red-600 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveEllipsisId(null);
                                                                    if (confirm("Apakah Anda yakin ingin menghapus tim ini?")) {
                                                                        router.delete(route("tim-perusahaan.destroy", { id: id, id_tim: tim.id }), { preserveScroll: true });
                                                                    }
                                                                }}
                                                            >
                                                                Hapus
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded-md bg-white/40">
                                                    <EllipsisVertical
                                                        size={18}
                                                        className="text-black hover:text-gray-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleEllipsis(tim.id);
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    onClick={() => router.visit(route("proyek", { id: id, id_tim: tim.id, id_board: tim.board_tim?.id }))}
                                                    className="rounded-xl h-full overflow-hidden"
                                                >
                                                    <div className="h-[168px] relative flex justify-center items-center">
                                                        <div className="w-[180px]">
                                                            <img
                                                                src="/img/kanban.png"
                                                                alt="Gambar grup proyek opsional"
                                                                className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 shadow-none group-hover:shadow-inset-lg transition-shadow duration-300"></div>
                                                    </div>
                                                    <div className="px-4 bg-white h-full">
                                                        <div className="pt-2">
                                                            <h1 className="text-lg text-gray-700 group-hover:underline cursor-pointer">
                                                                {tim.nama_tim}
                                                            </h1>
                                                            <p className="text-sm text-gray-400">
                                                                {tim.deskripsi_tim}
                                                            </p>
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
                                <div className="my-4 w-full rounded-lg mt-16">
                                    <div className="mb-5">
                                        <h1 className="text-2xl">Tim</h1>
                                    </div>
                                    <div className="grid grid-flow-row grid-cols-3 gap-10">
                                        {timBiasa.map((tim) => (
                                            <div
                                                key={tim.id}
                                                className="w-[328px] h-[234px] transition-all ease-in-out duration-300 cursor-pointer shadow-[2px_2px_15px_rgba(0,0,0,0.10)] bg-[#F0E460] hover:shadow-lg rounded-xl group relative"
                                            >
                                                {activeEllipsisId === tim.id && (
                                                    <div className="absolute left-72 z-50 top-8 bg-white shadow-lg rounded-md p-2 min-w-[120px]">
                                                        <ul className="space-y-2">
                                                            <li
                                                                className="cursor-pointer text-gray-700 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(tim);
                                                                }}
                                                            >
                                                                Edit
                                                            </li>
                                                            <li
                                                                className="cursor-pointer text-red-600 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveEllipsisId(null);
                                                                    if (confirm("Apakah Anda yakin ingin menghapus tim ini?")) {
                                                                        router.delete(route("tim-perusahaan.destroy", { id: id, id_tim: tim.id }), { preserveScroll: true });
                                                                    }
                                                                }}
                                                            >
                                                                Hapus
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded-md bg-white/40">
                                                    <EllipsisVertical
                                                        size={18}
                                                        className="text-black hover:text-gray-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleEllipsis(tim.id);
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    onClick={() => router.visit(route("proyek", { id: id, id_tim: tim.id, id_board: tim.board_tim?.id }))}
                                                    className="rounded-xl h-full overflow-hidden"
                                                >
                                                    <div className="h-[168px] relative flex justify-center items-center">
                                                        <div className="w-[180px]">
                                                            <img
                                                                src="/img/kanban.png"
                                                                alt="Gambar grup proyek opsional"
                                                                className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 shadow-none group-hover:shadow-inset-lg transition-shadow duration-300"></div>
                                                    </div>
                                                    <div className="px-4 h-full bg-white">
                                                        <div className="pt-2">
                                                            <h1 className="text-lg text-gray-700 group-hover:underline">
                                                                {tim.nama_tim}
                                                            </h1>
                                                            <p className="text-sm text-gray-400">
                                                                {tim.deskripsi_tim}
                                                            </p>
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
                    <div className="w-full mt-10 flex justify-center items-center">
                        <div className="w-[500px]">
                            <img src="/img/ilustrasi.png" alt="ilustrasi" className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
            </div>

            {/* Modal untuk buat tim */}
            {buatTimModal && (
                <BuatTimModal onClose={() => setBuatTimModal(false)} />
            )}

            {/* Modal untuk edit tim */}
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