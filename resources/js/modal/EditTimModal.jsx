import { useForm } from "@inertiajs/react";
import { CheckCircle, Loader2, X } from "lucide-react";
import { useEffect } from "react";

// Menerima props: `tim`, `onClose`, dan `id_perusahaan`
export default function EditTimModal({ tim, onClose, id_perusahaan }) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        wasSuccessful,
    } = useForm({
        // Inisialisasi form dengan data dari prop `tim`
        nama_tim: tim.nama_tim || "",
        deskripsi_tim: tim.deskripsi_tim || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Kirim request PUT dengan DUA parameter yang dibutuhkan: id dan id_tim
        put(route("tim-perusahaan.update", { id: id_perusahaan, id_tim: tim.id }), {
            preserveScroll: true,
            onSuccess: () => {
                onClose(); // Jika berhasil, tutup modal
            },
            onError: (errors) => {
                console.error("Error updating team:", errors);
            },
        });
    };

    // Efek untuk menutup modal jika proses update berhasil
    useEffect(() => {
        if (wasSuccessful) {
            onClose();
        }
    }, [wasSuccessful]);

    return (
        <div className="fixed inset-0 bg-black/50 z-[99] flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95">
                {/* Tombol Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                    disabled={processing}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Edit Tim
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input Nama Tim */}
                    <div>
                        <label
                            htmlFor="nama_tim"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nama Tim
                        </label>
                        <input
                            id="nama_tim"
                            type="text"
                            value={data.nama_tim}
                            onChange={(e) => setData("nama_tim", e.target.value)}
                            className={`w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors.nama_tim
                                    ? "border-red-400 focus:ring-red-400 bg-red-50"
                                    : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                            }`}
                            disabled={processing}
                        />
                        {errors.nama_tim && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.nama_tim}
                            </p>
                        )}
                    </div>

                    {/* Input Deskripsi Tim */}
                    <div>
                        <label
                            htmlFor="deskripsi_tim"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Deskripsi
                        </label>
                        <textarea
                            id="deskripsi_tim"
                            value={data.deskripsi_tim}
                            onChange={(e) => setData("deskripsi_tim", e.target.value)}
                            rows={3}
                            className={`w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors.deskripsi_tim
                                    ? "border-red-400 focus:ring-red-400 bg-red-50"
                                    : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                            }`}
                            disabled={processing}
                        />
                        {errors.deskripsi_tim && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.deskripsi_tim}
                            </p>
                        )}
                    </div>

                    {/* Tombol Submit */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Perubahan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}