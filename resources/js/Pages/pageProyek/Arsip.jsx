import Proyek from "../Proyek";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { ArchiveRestore, Trash2, ArrowLeft, Inbox } from "lucide-react";

const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function Arsip({ dashboardId, activePage, tim, archivedCards }) {
    const { auth, id_board } = usePage().props;

    const handleRestore = (cardId) => {
        router.put(
            route("proyek.card.restore", { id: auth.user.id, cardId }),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (cardId) => {
        if (
            confirm(
                "Anda yakin ingin menghapus tugas ini secara permanen? Aksi ini tidak dapat dibatalkan."
            )
        ) {
            router.delete(
                route("proyek.card.delete", { id: auth.user.id, cardId }),
                {
                    preserveScroll: true,
                }
            );
        }
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head title="Arsip Tugas" />
            <div className="p-6 bg-slate-50 rounded-lg h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Arsip Tugas
                    </h1>
                    <Link
                        href={route("proyek", {
                            id: auth.user.id,
                            id_tim: tim.id,
                            id_board: id_board,
                        })}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-sm hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-semibold">Kembali ke Papan</span>
                    </Link>
                </div>

                <div className="space-y-4">
                    {archivedCards.length > 0 ? (
                        archivedCards.map((card) => (
                            <div
                                key={card.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="mb-3 sm:mb-0">
                                    <p className="text-lg font-bold text-gray-900">
                                        {card.nama_card}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Diarsipkan dari list:{" "}
                                        <span className="font-semibold text-gray-600">
                                            {card.list_board.judul}
                                        </span>{" "}
                                        -{" "}
                                        <span className="italic">
                                            {formatDate(card.archived_at)}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleRestore(card.id)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <ArchiveRestore size={16} />
                                        <span>Kembalikan</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-xl">
                            <Inbox
                                className="mx-auto h-12 w-12 text-gray-400"
                                strokeWidth={1.5}
                            />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">
                                Arsip Kosong
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Tidak ada tugas yang diarsipkan saat ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Proyek>
    );
}