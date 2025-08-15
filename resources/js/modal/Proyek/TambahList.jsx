import { X } from "lucide-react";
import Input from "../input/Input";
import { useState } from "react";
import { router } from "@inertiajs/react";

export default function TambahList ({id, id_board, close}) {

    const [formData, setFormData] = useState({
        nama_list: "",
        id_board: id_board,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if(errors[name]){
            setErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const newErrors = {};
        if(!formData.nama_list.trim()){
            newErrors.nama_list = "Nama list harus diisi!"
        }

        if(Object.keys(newErrors).length > 0){
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        const submitData = new FormData();
        submitData.append("nama_list", formData.nama_list);
        submitData.append("id_board", formData.id_board);

        router.post(route("proyek.list.store", {id: id}),
        submitData,
        {
            forceFormData: true,
            onSuccess: () => {
                console.log("berhasil membuat lsit");
                close()
            },
            onError: (errors) => {
                setErrors(errors);
                console.log("Error: ", errors);
            },
            onFinish: () => {
                setLoading(false);
            }
        }
    );
    }

    return (
        <div className="fixed top-0 bg-black/20 w-screen h-screen z-50 flex justify-center items-center">
            <div className="p-5 bg-white relative rounded-lg w-[500px] px-8">
                <X
                    onClick={close}
                    className="cursor-pointer absolute top-0 right-0 m-5 hover:bg-gray-100 rounded p-1"
                />
                <form onSubmit={handleSubmit}>
                    <div className="mt-10 mb-6">
                        <h1 className="text-2xl font-semibold">Tambah List</h1>
                    </div>

                    <Input
                        label="Nama List"
                        name="nama_list"
                        id="nama_list"
                        value={formData.nama_list}
                        onChange={handleInputChange}
                        onBlur={() => {}}
                        placeholder="Masukkan nama list..."
                        className={errors.nama_tugas ? "border-red-500" : ""}
                    />
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