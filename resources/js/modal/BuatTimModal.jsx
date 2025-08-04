import { PlusCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Input from "./input/Input";
import { useForm, usePage } from "@inertiajs/react";

export default function BuatTimModal({onClose}) {
    // modal tim ref
    const modalTimRef = useRef(null);

    const { auth } = usePage().props;

    // use form
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_tim: "",
        deskripsi_tim: "",
        jenis_tim: "",
    });

    // handle submit
     const handleSubmit = (e) => {
         e.preventDefault();
         post(route("tim-perusahaan.store", { id: auth.user.id }), {
             onSuccess: () => {
                 reset();
                 onClose(); // tutup modal setelah sukses
             },
         });
     };

    // radio state
    const [jenisTim, setJenisTim] = useState("");

    // handleClick Outside
    useEffect(() => {
        function handleClickOutside (e) {
            if(modalTimRef.current && !modalTimRef.current.contains(e.target)){
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    })

    return (
        <>
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div
                    ref={modalTimRef}
                    className="bg-white rounded-lg p-6 px-10 shadow-lg w-[500px]"
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
                                className="py-2 px-3 bg-blue-600 text-white rounded-md w-full"
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