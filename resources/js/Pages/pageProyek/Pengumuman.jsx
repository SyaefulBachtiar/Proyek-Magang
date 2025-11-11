import Proyek from "../Proyek";
import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function Pengumuman({
    dashboardId,
    activePage,
    tim,
    listPengumuman,
}) {
    const { auth } = usePage().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPengumuman, setEditingPengumuman] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        delete: destroy,
    } = useForm({
        judul: "",
        isi: "",
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: processingEdit,
        errors: errorsEdit,
        reset: resetEdit,
    } = useForm({
        judul: "",
        isi: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = route("proyek.pengumuman.store", {
            id: dashboardId,
            id_tim: tim.id,
        });
        post(url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
            preserveScroll: true,
        });
    };

    const handleEditClick = (pengumuman) => {
        setEditingPengumuman(pengumuman);
        setEditData({ judul: pengumuman.judul, isi: pengumuman.isi });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        const url = route("proyek.pengumuman.update", {
            id: dashboardId,
            pengumuman: editingPengumuman.id,
        });
        put(url, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingPengumuman(null);
            },
            preserveScroll: true,
        });
    };

    const handleDelete = (pengumuman) => {
        if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
            const url = route("proyek.pengumuman.destroy", {
                id: dashboardId,
                pengumuman: pengumuman.id,
            });
            destroy(url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <div className="p-4 md:p-8 h-full bg-gray-100">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Papan Pengumuman - {tim.nama_tim}
                    </h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full md:w-auto px-4 py-3 md:py-2 bg-[#006F78] text-white rounded-lg font-semibold shadow-md hover:bg-[#005a62] transition duration-200 ease-in-out transform hover:scale-105"
                    >
                        Buat Pengumuman Baru
                    </button>
                </div>

                {listPengumuman.length === 0 ? (
                    <div className="text-center py-10 md:py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-base font-medium text-gray-900">
                            Belum ada pengumuman
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Buat pengumuman pertama Anda untuk tim.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {listPengumuman.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border rounded-xl shadow-sm p-4 md:p-6 transition hover:shadow-lg"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-1 md:gap-4 mb-3">
                                    <h2 className="text-xl font-bold text-[#006F78]">
                                        {item.judul}
                                    </h2>
                                    <span className="text-sm text-gray-500 flex-shrink-0 ml-0 md:ml-4">
                                        {new Date(
                                            item.created_at
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm md:text-base text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                                    {item.isi}
                                </p>
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pt-3 border-t mt-4">
                                    <div className="text-sm text-gray-600 font-medium">
                                        - Dibuat oleh {item.pembuat.name}
                                    </div>
                                    {auth.user.id === item.user_id && (
                                        <div className="flex items-center space-x-2 self-end md:self-auto">
                                            <button
                                                onClick={() =>
                                                    handleEditClick(item)
                                                }
                                                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                                title="Edit Pengumuman"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                                className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                                title="Hapus Pengumuman"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Transition
                show={isCreateModalOpen}
                as="div"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={() => setIsCreateModalOpen(false)}
            >
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as="div"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as="div"
                        className="inline-block w-full max-w-lg p-4 md:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <h3 className="text-lg md:text-xl font-bold leading-6 text-gray-900 mb-4">
                            Buat Pengumuman Baru
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="judul"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Judul
                                    </label>
                                    <input
                                        type="text"
                                        id="judul"
                                        value={data.judul}
                                        onChange={(e) =>
                                            setData("judul", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006F78] focus:border-[#006F78]"
                                        required
                                    />
                                    {errors.judul && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.judul}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="isi"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Isi Pengumuman
                                    </label>
                                    <textarea
                                        id="isi"
                                        rows="6"
                                        value={data.isi}
                                        onChange={(e) =>
                                            setData("isi", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006F78] focus:border-[#006F78]"
                                        required
                                    ></textarea>
                                    {errors.isi && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.isi}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 sm:space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-[#006F78] border border-transparent rounded-md shadow-sm hover:bg-[#005a62] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006F78] disabled:opacity-50"
                                >
                                    {processing
                                        ? "Mengirim..."
                                        : "Kirim Pengumuman"}
                                </button>
                            </div>
                        </form>
                    </Transition.Child>
                </div>
            </Transition>

            <Transition
                show={isEditModalOpen}
                as="div"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={() => setIsEditModalOpen(false)}
            >
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as="div"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as="div"
                        className="inline-block w-full max-w-lg p-4 md:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <h3 className="text-lg md:text-xl font-bold leading-6 text-gray-900 mb-4">
                            Edit Pengumuman
                        </h3>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="edit-judul"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Judul
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-judul"
                                        value={editData.judul}
                                        onChange={(e) =>
                                            setEditData("judul", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006F78] focus:border-[#006F78]"
                                        required
                                    />
                                    {errorsEdit.judul && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errorsEdit.judul}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="edit-isi"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Isi Pengumuman
                                    </label>
                                    <textarea
                                        id="edit-isi"
                                        rows="6"
                                        value={editData.isi}
                                        onChange={(e) =>
                                            setEditData("isi", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006F78] focus:border-[#006F78]"
                                        required
                                    ></textarea>
                                    {errorsEdit.isi && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errorsEdit.isi}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 sm:space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="w-full sm:w-auto px-4 py-2.5 md:py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingEdit}
                                    className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 md:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processingEdit
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </Transition.Child>
                </div>
            </Transition>
        </Proyek>
    );
}