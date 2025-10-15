import Proyek from "../Proyek";
import { Head, router, usePage } from "@inertiajs/react";
import { Archive, ArrowLeft } from "lucide-react";

export default function Arsip() {
    const { dashboardId, id_tim, tim } = usePage().props;
    const { arsipCards } = usePage().props; // Ambil data arsip dari props

    const goBack = () => {
        const boardId = tim.board_tim?.id;
        if (boardId) {
            router.visit(route('proyek', { id: dashboardId, id_tim, id_board: boardId }));
        } else {
            // Jika karena suatu alasan boardId tidak ditemukan, kembali ke halaman sebelumnya
            window.history.back();
        }
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={'tugasPage'} tim={tim}>
            <Head title="Arsip Tugas" />
            {/* Overlay gelap di belakang modal */}
            <div className="fixed inset-0 bg-black/30 z-40" onClick={goBack}></div>
            
            {/* Konten Modal Arsip */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl h-[70vh] flex flex-col">
                <div className="p-4 border-b flex items-center gap-4">
                    <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Archive size={22} />
                        Arsip Tugas
                    </h2>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    {arsipCards && arsipCards.length > 0 ? (
                        <ul className="space-y-2">
                            {arsipCards.map(card => (
                                <li key={card.id} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                                    <p className="font-medium">{card.nama_card}</p>
                                    <div className="flex items-center gap-2">
                                        {/* Tombol Pulihkan saat ini dinonaktifkan, bisa diaktifkan nanti */}
                                        <button disabled className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded cursor-not-allowed">
                                            Pulihkan
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>Tidak ada tugas yang diarsipkan.</p>
                        </div>
                    )}
                </div>
            </div>
        </Proyek>
    );
}