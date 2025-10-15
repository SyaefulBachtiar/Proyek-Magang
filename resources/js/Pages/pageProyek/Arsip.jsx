import { router } from "@inertiajs/react";
import { X, ArchiveRestore } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios"; // Kita gunakan axios untuk request JSON sederhana

export default function Arsip({ show, onClose, id_tim, dashboardId }) {
    const [archivedTasks, setArchivedTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ambil data arsip ketika modal ditampilkan
    useEffect(() => {
        if (show) {
            setLoading(true);
            axios.get(route("proyek.arsip.show", { id: dashboardId, id_tim }))
                .then(response => {
                    setArchivedTasks(response.data);
                })
                .catch(error => {
                    console.error("Gagal mengambil data arsip:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [show]);

    // Fungsi untuk memulihkan tugas
    const handleRestore = (cardId) => {
        router.put(route('proyek.card.restore', { id: dashboardId, card_id: cardId }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Hapus tugas dari daftar arsip di state setelah berhasil dipulihkan
                setArchivedTasks(prevTasks => prevTasks.filter(task => task.id !== cardId));
            }
        });
    };

    if (!show) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 bg-black/30 w-screen h-screen z-50 flex justify-center items-center">
            <div className="p-5 bg-white relative rounded-lg w-[700px] h-[80%] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h1 className="text-2xl font-semibold">Tugas yang Diarsipkan</h1>
                    <X
                        onClick={onClose}
                        className="cursor-pointer hover:bg-gray-100 rounded p-1"
                    />
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {loading ? (
                        <p className="text-center text-gray-500">Memuat...</p>
                    ) : archivedTasks.length > 0 ? (
                        <ul className="space-y-3">
                            {archivedTasks.map(task => (
                                <li key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                                    <div>
                                        <p className="font-semibold">{task.nama_card}</p>
                                        <p className="text-xs text-gray-500">
                                            Diarsipkan pada: {new Date(task.archived_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(task.id)}
                                        title="Pulihkan tugas"
                                        className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md"
                                    >
                                        <ArchiveRestore size={16} />
                                        Pulihkan
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500">Tidak ada tugas yang diarsipkan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}