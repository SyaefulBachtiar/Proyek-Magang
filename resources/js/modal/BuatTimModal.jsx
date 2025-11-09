import { PlusCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Input from "./input/Input";
import { useForm, usePage } from "@inertiajs/react";

export default function BuatTimModal({ onClose }) {
    const modalTimRef = useRef(null);
    const { auth } = usePage().props;

    const [imagePreview, setImagePreview] = useState(null);
    // use form
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_tim: "",
        deskripsi_tim: "",
        jenis_tim: "",
        image: null, 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tim-perusahaan.store", { id: auth.user.id }), {
            onSuccess: () => {
                reset();
                setImagePreview(null);
                onClose();
            },
        });
    };

    // radio state
    const [jenisTim, setJenisTim] = useState("");
    useEffect(() => {
        function handleClickOutside(e) {
            if (modalTimRef.current && !modalTimRef.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setData("image", null);
            setImagePreview(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
                <div
                    ref={modalTimRef}
                    className="bg-white rounded-lg p-6 px-10 shadow-lg w-full max-w-lg max-h-full overflow-y-auto"
                >
                    <div className="flex justify-end">
                        <X onClick={onClose} className="cursor-pointer" />
                    </div>
                    <div>
                        <div className="my-5">
                            <h1 className="text-xl font-bold">Buat Tim</h1>
                        </div>
                        <form className="my-5" onSubmit={handleSubmit}>
                            <Input
                                id="namaTim"
                                label="Nama Tim"
                                value={data.nama_tim}
                                onChange={(e) =>
                                    setData("nama_tim", e.target.value)
                                }
                            />
                            {errors.nama_tim && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.nama_tim}
                                </p>
                            )}

                            <Input
                                id="deskripsi"
                                label="Deskripsi"
                                value={data.deskripsi_tim}
                                onChange={(e) =>
                                    setData("deskripsi_tim", e.target.value)
                                }
                            />
                            {errors.deskripsi_tim && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.deskripsi_tim}
                                </p>
                            )}

                            <div className="mt-5">
                                <label
                                    htmlFor="image"
                                    className="block text-sm font-bold text-gray-700 mb-2"
                                >
                                    Gambar Tim (Opsional)
                                </label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                                {errors.image && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* Preview Gambar */}
                            {imagePreview && (
                                <div className="mt-4">
                                    <p className="font-bold text-sm mb-2">
                                        Preview:
                                    </p>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-md border"
                                    />
                                </div>
                            )}

                            <div className="mt-5 mb-5">
                                <p className="font-bold mb-2">Jenis Tim</p>
                                <div className="flex flex-col gap-3">
                                    {["proyek", "tim"].map((jenis) => (
                                        <label
                                            key={jenis}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="radio"
                                                name="jenis_tim"
                                                value={jenis}
                                                checked={
                                                    data.jenis_tim === jenis
                                                }
                                                onChange={() =>
                                                    setData("jenis_tim", jenis)
                                                }
                                                className="form-radio text-blue-600"
                                            />
                                            <span className="text-gray-600 capitalize">
                                                {jenis}
                                            </span>
                                        </label>
                                    ))}
                                    {errors.jenis_tim && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.jenis_tim}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                disabled={processing}
                                type="submit"
                                className="py-2 px-3 bg-blue-600 text-white rounded-md w-full disabled:opacity-50"
                            >
                                {processing ? "Menyimpan..." : "Submit"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}