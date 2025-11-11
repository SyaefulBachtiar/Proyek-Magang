import { router, useForm, usePage } from "@inertiajs/react";
import { ChevronLeft, Pen, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Label({
    close,
    refTrigger,
    card_id,
    id_tim,
    label_tim_prop,
    label_card_prop,
}) {
    const user = usePage().props.auth.user;
    const [loading, setLoading] = useState(null);
    const [selectedLabel, setSelectedLabel] = useState([]);
    const [editLabel, setEditLabel] = useState(false);
    const [editingLabel, setEditingLabel] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                refTrigger &&
                !refTrigger.contains(e.target)
            ) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FF33A8",
        "#FFC300",
        "#8E44AD",
        "#16A085",
        "#E67E22",
        "#2C3E50",
        "#D35400",
    ];

    useEffect(() => {
        if (label_card_prop) {
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

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            if (isChecked) {
                const response = await fetch(
                    route("label.card.store", { id: user.id, id_card: card_id }),
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrfToken,
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        body: JSON.stringify({
                            label_id: labelId,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Gagal menambahkan label");
                }
            } else {
                const response = await fetch(
                    route("label.card.delete", {
                        id: user.id,
                        card_id: card_id,
                        label_id: labelId,
                    }),
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrfToken,
                            Accept: "application/json",
                        },
                    }
                );
            }
        } catch (error) {
            if (isChecked) {
                setSelectedLabel((prev) => prev.filter((id) => id !== labelId));
            } else {
                setSelectedLabel((prev) => [...prev, labelId]);
            }
            console.log("error: ", error);
        } finally {
            setLoading(null);

            router.reload({
                only: ["label_card"],
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleEdit = (label) => {
        setEditLabel(true);
        setIsEditMode(true);
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
            warna: colors[null],
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();

        if (isEditMode && editingLabel) {
            put(
                route("label.update", {
                    id: user.id,
                    id_tim: id_tim,
                    id_label: editingLabel.id,
                }),
                {
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
                }
            );
        } else {
            post(
                route("label.store", {
                    id: user.id,
                    id_card: card_id,
                    id_tim: id_tim,
                }),
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
                destroy(
                    route("label.delete", {
                        id: user.id,
                        label_id: editingLabel.id,
                    }),
                    {
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
                    }
                );
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
            <div
                ref={modalRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xs sm:max-w-sm md:absolute md:top-11 md:right-10 md:w-auto md:min-w-[300px] md:max-w-none md:transform-none bg-white shadow-[0_5px_10px_rgba(0,0,0,0.25)] rounded-lg max-h-[85vh] md:max-h-[400px] overflow-hidden"
            >
                <div
                    className={`py-3 px-3 md:py-4 md:px-4 relative overflow-hidden h-full flex flex-col ${
                        editLabel
                            ? "h-[85vh] md:h-[400px]"
                            : "max-h-[85vh] md:max-h-[400px]"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h1 className="text-base md:text-lg font-semibold">
                            Label
                        </h1>
                        <X
                            onClick={close}
                            className="cursor-pointer hover:bg-gray-100 rounded p-1"
                            size={20}
                        />
                    </div>
                    <div className="p-1 md:p-2 overflow-y-auto my-scrollable-element flex-1">
                        <div>
                            <input
                                type="text"
                                placeholder="Cari label..."
                                className="w-full rounded-md text-sm md:text-base"
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
                                        className="w-5 h-5 sm:w-4 sm:h-4"
                                    />
                                    <div
                                        className={`w-full min-h-[30px] flex items-center p-2 rounded-sm text-white`}
                                        style={{
                                            backgroundColor: label.warna,
                                            color: label.warna
                                                ? "white"
                                                : "black",
                                        }}
                                    >
                                        <p className="text-sm">
                                            {label.title}
                                        </p>
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
                                className="p-2.5 md:p-2 text-sm md:text-base bg-gray-200 hover:bg-gray-300 w-full rounded-sm transition-colors"
                                disabled={loading !== null}
                            >
                                {loading !== null
                                    ? "Loading..."
                                    : "Tambahkan Label"}
                            </button>
                        </div>
                    </div>
                    {editLabel && (
                        <div className="absolute top-0 left-0 w-full h-full overflow-x-hidden flex flex-col bg-white p-2 md:p-3 rounded-lg border">
                            <div
                                onClick={handleKembali}
                                className="cursor-pointer hover:bg-gray-200 w-fit rounded-md p-1"
                            >
                                <ChevronLeft />
                            </div>
                            <h1 className="font-semibold mt-3 md:mt-5 text-base md:text-lg">
                                {isEditMode
                                    ? "Edit Label"
                                    : "Tambah Label Baru"}
                            </h1>
                            <div className="h-full flex-1 my-scrollable-element p-1 md:p-2 overflow-y-auto">
                                <h2 className="font-medium mt-4 mb-2 text-sm md:text-base">
                                    Warna Saat Ini
                                </h2>
                                <div
                                    className="w-full h-[50px] rounded-md my-2 border-2 border-gray-200 flex items-center justify-center text-sm md:text-base"
                                    style={{
                                        backgroundColor:
                                            data.warna || "#f5f5f5",
                                        color: data.warna ? "white" : "#999",
                                    }}
                                >
                                    {!data.warna && (
                                        <span className="text-sm">
                                            Tidak ada warna
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Nama Label
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm md:text-base"
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
                                                style={{
                                                    backgroundColor: col,
                                                }}
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
                                        className="p-2.5 md:p-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md text-white transition-colors flex items-center justify-center gap-2 text-sm"
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
                                        className="p-2.5 md:p-2 w-full bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm"
                                    >
                                        Hapus Warna
                                    </button>

                                    {isEditMode && (
                                        <button
                                            onClick={handleHapusLabel}
                                            disabled={processing}
                                            className="p-2.5 md:p-2 w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-md text-white transition-colors text-sm"
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