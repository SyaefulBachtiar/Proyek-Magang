import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Input from "./input/Input";

export default function BuatTimModal({onClose}) {
    // modal tim ref
    const modalTimRef = useRef(null);

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
                    className="bg-white rounded-lg p-6 px-10 shadow-lg w-[500px] h-3/4"
                >
                    <div className="flex justify-end">
                        <X onClick={onClose} className="cursor-pointer" />
                    </div>
                    <div>
                        <div className="my-5">
                            <h1 className="text-4xl">Buat Tim</h1>
                        </div>
                        <form className="my-5">
                            <Input id="namaTim" label="Nama Tim" />

                            <Input id="deskripsi" label="Deskripsi" />

                            {/* Radio Button: Jenis Tim */}
                            <div className="mt-6">
                                <p className="font-bold mb-2">Jenis Tim</p>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="jenisTim"
                                                value="proyek"
                                                checked={jenisTim === "proyek"}
                                                onChange={(e) =>
                                                    setJenisTim(e.target.value)
                                                }
                                                className="form-radio text-blue-600"
                                            />
                                            <span className="text-gray-600">
                                                Proyek
                                            </span>
                                        </label>
                                        {jenisTim === "proyek" && (
                                            <p>Tes</p>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="jenisTim"
                                            value="Tim"
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="text-gray-600">
                                            Tim
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}