import { X } from "lucide-react";
import Input from "../input/Input";
import { useState } from "react";
import { router } from "@inertiajs/react";

export default function TambahCard({ id_list, close, id, id_tim, id_board }) {
    const [formData, setFormData] = useState({
        nama_tugas: "",
        id_list: id_list,
        image: null,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error saat user mulai mengetik
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validasi client-side
        const newErrors = {};
        if (!formData.nama_tugas.trim()) {
            newErrors.nama_tugas = "Nama tugas harus diisi";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        // Buat FormData untuk upload file
        const submitData = new FormData();
        submitData.append("nama_tugas", formData.nama_tugas);
        submitData.append("id_list", formData.id_list);
        if (formData.image) {
            submitData.append("image", formData.image);
        }

        // Submit menggunakan Inertia
        router.post(route('proyek.card.store', { id: id, id_tim: id_tim, id_board: id_board }),
            submitData,
            {
                forceFormData: true,
                onSuccess: (response) => {
                    console.log("Card berhasil ditambahkan");
                    close(); // Tutup modal
                    // Optional: refresh halaman atau update state parent
                },
                onError: (errors) => {
                    setErrors(errors);
                    console.error("Error:", errors);
                },
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <div className="fixed top-0 bg-black/20 w-screen h-screen z-50 flex justify-center items-center">
            <div className="p-5 bg-white relative rounded-lg w-[500px] px-8">
                <X
                    onClick={close}
                    className="cursor-pointer absolute top-0 right-0 m-5 hover:bg-gray-100 rounded p-1"
                />

                <form onSubmit={handleSubmit}>
                    <div className="mt-10 mb-6">
                        <h1 className="text-2xl font-semibold">Tambah Tugas</h1>
                    </div>

                    <div className="mb-4">
                        <Input
                            label="Nama Tugas"
                            name="nama_tugas"
                            id="nama_tugas"
                            value={formData.nama_tugas}
                            onChange={handleInputChange}
                            onBlur={() => {}}
                            placeholder="Masukkan nama tugas..."
                            className={
                                errors.nama_tugas ? "border-red-500" : ""
                            }
                        />
                        {errors.nama_tugas && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.nama_tugas}
                            </p>
                        )}
                    </div>

                    {/* Optional: Upload gambar */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gambar (Opsional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.image && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={close}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
