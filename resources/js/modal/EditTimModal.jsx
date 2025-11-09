import { useForm } from "@inertiajs/react";
import { CheckCircle, Loader2, X, Trash2 } from "lucide-react"; 
import { useEffect, useState } from "react";

export default function EditTimModal({ tim, onClose, id_perusahaan }) {
    
    const [imagePreview, setImagePreview] = useState(null);

    const {
        data,
        setData,
        post, 
        processing,
        errors,
        wasSuccessful,
    } = useForm({
        nama_tim: tim.nama_tim || "",
        deskripsi_tim: tim.deskripsi_tim || "",
        image: null, 
        _delete_image: false, 
        _method: "PUT", 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route("tim-perusahaan.update", { id: id_perusahaan, id_tim: tim.id }), {
            preserveScroll: true,
            onSuccess: () => {
                onClose(); 
            },
            onError: (errors) => {
                console.error("Error updating team:", errors);
            },
        });
    };

    // Fungsi untuk menangani perubahan file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prevData) => ({
                ...prevData,
                image: file,
                _delete_image: false 
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Fungsi untuk menghapus gambar
    const handleDeleteImage = () => {
        setData((prevData) => ({
            ...prevData,
            image: null,
            _delete_image: true 
        }));
        setImagePreview(null); 
        const fileInput = document.getElementById("image_edit");
        if (fileInput) fileInput.value = "";
    };

    const currentImageUrl = tim.image ? `/storage/${tim.image}` : null;
    const displayImage = imagePreview || (data._delete_image ? null : currentImageUrl);

    useEffect(() => {
        if (wasSuccessful) {
            onClose();
        }
    }, [wasSuccessful]);

    return (
        <div className="fixed inset-0 bg-black/50 z-[99] flex justify-center items-center overflow-y-auto p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 max-h-full overflow-y-auto">
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
                            htmlFor="nama_tim_edit"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nama Tim
                        </label>
                        <input
                            id="nama_tim_edit"
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
                            htmlFor="deskripsi_tim_edit"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Deskripsi
                        </label>
                        <textarea
                            id="deskripsi_tim_edit"
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
                    <div>
                        <label
                            htmlFor="image_edit"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Gambar Tim
                        </label>
                        
                        {/* Preview Gambar */}
                        {displayImage && (
                            <div className="mt-2 mb-2 relative w-full h-40">
                                <img
                                    src={displayImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-md border"
                                />
                            </div>
                        )}

                        {/* Tombol Hapus Gambar */}
                        {(displayImage) && (
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors mb-2"
                                disabled={processing}
                            >
                                <Trash2 size={14} />
                                Hapus Gambar
                            </button>
                        )}

                        <input
                            id="image_edit"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            disabled={processing}
                        />
                        {errors.image && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.image}
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