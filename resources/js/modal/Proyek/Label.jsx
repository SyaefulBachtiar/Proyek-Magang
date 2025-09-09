    import { router, useForm, usePage } from "@inertiajs/react";
    import { ChevronLeft, Pen, Save, X } from "lucide-react";
    import { useEffect, useRef, useState } from "react";

    export default function Label({ close, refTrigger, card_id, id_tim, label_tim_prop, label_card_prop}) {

        const user = usePage().props.auth.user;
        const [loading, setLoading] = useState(null);
        const [selectedLabel, setSelectedLabel] = useState([]);
        const [editLabel, setEditLabel] = useState(false);
        const [editingLabel, setEditingLabel] = useState(null);
        const [isEditMode, setIsEditMode] = useState(false); // Untuk membedakan edit vs tambah baru
        const modalRef = useRef(null);

        useEffect(() => {
            function handleClickOutside (e) {
                if(modalRef.current && !modalRef.current.contains(e.target) && refTrigger && !refTrigger.contains(e.target)){
                    close();
                }
            }

            document.addEventListener("mousedown", handleClickOutside);

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            }
        }, [modalRef, refTrigger]);

        const {
            data,
            setData,
            put,
            post,
            delete: destroy,
            processing,
            errors,
            reset,
        } = useForm({
            title: "",
            warna: "",
        });

        const colors = [
            "#FF5733", // orange-red
            "#33FF57", // green
            "#3357FF", // blue
            "#FF33A8", // pink
            "#FFC300", // yellow
            "#8E44AD", // purple
            "#16A085", // teal
            "#E67E22", // orange
            "#2C3E50", // dark blue
            "#D35400", // deep orange
        ];

        useEffect(() => {
            if(label_card_prop) {
                setSelectedLabel(label_card_prop.map((lc) => lc.id_label_tim));
            }
        }, [label_card_prop]);

        const handleCheckboxChange = async (e, labelId) => {
            const isChecked = e.target.checked;

            setLoading(labelId);

            if (isChecked) {
                setSelectedLabel((prev) => [...prev, labelId]);
            } else {
                setSelectedLabel((prev) => prev.filter((id) => id !== labelId));
            }

            try{
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if(isChecked) {
                    const response = await fetch(route('label.card.store', {id: user.id, id_card: card_id}), 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                            body: JSON.stringify({
                                label_id: labelId
                            })
                    });

                    if(!response.ok){
                        throw new Error('Gagal menambahkan label');
                    }
                }else{
                    const response = await fetch(route('label.card.delete', {id: user.id, card_id: card_id, label_id: labelId}),
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    }
                });
                }
            }catch(error){
                if( isChecked) {
                    setSelectedLabel(prev => prev.filter(id => id !== labelId));
                }else{
                    setSelectedLabel((prev) => [...prev, labelId]);
                }
                console.log("error: ", error);
            }finally{
                setLoading(null);

                router.reload({
                    only: ["label_card"],
                    preserveState: true,
                    preserveScroll: true
                });
            }
        }

        const handleEdit = (label) => {
            setEditLabel(true);
            setIsEditMode(true);
            // setSelectedLabel(label);
            setEditingLabel(label);
            setData({
                title: label.title,
                warna: label.warna,
            });
        };

        const handleTambahLabel = () => {
            setEditLabel(true);
            setIsEditMode(false);
            setEditingLabel(null);
            setData({
                title: "",
                warna: colors[null], // Set default warna pertama
            });
        };

        const handleSaveEdit = (e) => {
            e.preventDefault();

            if (isEditMode && editingLabel) {
                // Update label yang sudah ada
                put(route("label.update", {id: user.id, id_tim: id_tim, id_label: editingLabel.id}), {
                    progress: false,
                    onSuccess: () => {
                        setEditLabel(false);
                        setEditingLabel(null);
                        setIsEditMode(false);
                        reset();
                    },
                    onError: () => {
                        console.log("Error updating label");
                    },
                });
            } else {
                // Tambah label baru
                post(
                    route("label.store", { id: user.id, id_card: card_id, id_tim: id_tim }),
                    {
                        progress: false,
                        onSuccess: () => {
                            setEditLabel(false);
                            setEditingLabel(null);
                            setIsEditMode(false);
                            reset();
                        },
                        onError: () => {
                            console.log("Error creating label");
                        },
                    }
                );
            }
        };

        const handleHapusLabel = (e) => {
            e.preventDefault();

            if (isEditMode && editingLabel) {
                if (confirm("Apakah Anda yakin ingin menghapus label ini?")) {
                    destroy(route("label.delete", {id: user.id, label_id: editingLabel.id}), {
                        onSuccess: () => {
                            setEditLabel(false);
                            setEditingLabel(null);
                            setIsEditMode(false);
                            reset();
                            if (refTrigger) {
                                refTrigger();
                            }
                        },
                        onError: () => {
                            console.log("Error deleting label");
                        },
                    });
                }
            }
        };

        const handlePilihWarna = (warna) => {
            setData("warna", warna);
        };

        const handleHapusWarna = () => {
            setData("warna", "");
        };

        const handleKembali = () => {
            setEditLabel(false);
            setEditingLabel(null);
            setIsEditMode(false);
            reset();
        };

        return (
            <>
                <div ref={modalRef} className="absolute top-11 right-10 bg-white shadow-[0_5px_10px_rgba(0,0,0,0.25)] rounded-lg min-w-[300px] max-h-[400px] overflow-hidden">
                    <div
                        className={`py-4 px-4 relative overflow-hidden ${
                            editLabel ? "h-[400px]" : "max-h-[400px]"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold">Label</h1>
                            <X
                                onClick={close}
                                className="cursor-pointer hover:bg-gray-100 rounded p-1"
                                size={20}
                            />
                        </div>
                        <div className="p-2 overflow-y-auto my-scrollable-element">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Cari label..."
                                    className="w-full rounded-md"
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                {label_tim_prop.map((label) => (
                                    <div
                                        key={label.id}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLabel.includes(
                                                label.id
                                            )}
                                            onChange={(e) =>
                                                handleCheckboxChange(e, label.id)
                                            }
                                        />
                                        <div
                                            className={`w-full h-[30px] flex items-center p-2 rounded-sm text-white`}
                                            style={{
                                                backgroundColor: label.warna,
                                                color: label.warna
                                                    ? "white"
                                                    : "black",
                                            }}
                                        >
                                            <p>{label.title}</p>
                                        </div>
                                        <div
                                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                                            onClick={() => handleEdit(label)}
                                        >
                                            <Pen size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center items-center mt-4">
                                <button
                                    onClick={handleTambahLabel}
                                    className="p-2 bg-gray-200 hover:bg-gray-300 w-full rounded-sm transition-colors"
                                    disabled={loading !== null}
                                >
                                    {loading !== null ? "Loading..." : "Tambahkan Label"}
                                </button>
                            </div>
                        </div>
                        {editLabel && (
                            <div className="absolute top-0 left-0 min-w-[300px] h-[400px] overflow-x-hidden flex flex-col bg-white p-2 rounded-lg border">
                                <div
                                    onClick={handleKembali}
                                    className="cursor-pointer hover:bg-gray-200 w-fit rounded-md p-1"
                                >
                                    <ChevronLeft />
                                </div>
                                <h1 className="font-semibold mt-5">
                                    {isEditMode
                                        ? "Edit Label"
                                        : "Tambah Label Baru"}
                                </h1>
                                <div className="h-full flex-1 my-scrollable-element p-2">
                                    <h2 className="font-medium mt-4 mb-2">
                                        Warna Saat Ini
                                    </h2>
                                    <div
                                        className="w-full h-[50px] rounded-md my-2 border-2 border-gray-200 flex items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                data.warna || "#f5f5f5",
                                            color: data.warna ? "white" : "#999",
                                        }}
                                    >
                                        {!data.warna && (
                                            <span>Tidak ada warna</span>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">
                                            Nama Label
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            placeholder="Masukkan nama label..."
                                            value={data.title || ""}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">
                                            Pilih Warna
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {colors.map((col, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-[35px] cursor-pointer rounded border-2 transition-all hover:scale-105 ${
                                                        data.warna === col
                                                            ? "border-gray-800 shadow-lg"
                                                            : "border-gray-200"
                                                    }`}
                                                    style={{ backgroundColor: col }}
                                                    onClick={() =>
                                                        handlePilihWarna(col)
                                                    }
                                                    title={`Pilih warna ${col}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={
                                                processing || !data.title.trim()
                                            }
                                            className="p-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} />
                                            {processing
                                                ? "Menyimpan..."
                                                : isEditMode
                                                ? "Perbarui Label"
                                                : "Simpan Label"}
                                        </button>

                                        <button
                                            onClick={handleHapusWarna}
                                            type="button"
                                            className="p-2 w-full bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                                        >
                                            Hapus Warna
                                        </button>

                                        {isEditMode && (
                                            <button
                                                onClick={handleHapusLabel}
                                                disabled={processing}
                                                className="p-2 w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-md text-white transition-colors"
                                            >
                                                {processing
                                                    ? "Menghapus..."
                                                    : "Hapus Label"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
