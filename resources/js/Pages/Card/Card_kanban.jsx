import { useEffect, useReducer, useRef, useState } from "react";
import {
    CalendarDays,
    Captions,
    CopyCheck,
    MessageSquareText,
    Paperclip,
    Pencil,
    Plus,
    Save,
    SquareCheck,
    Tag,
    Tags,
    Trash2,
    UserRoundPlus,
    X,
} from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Proyek from "../Proyek";
import TambahAnggota from "@/modal/Proyek/TambahAnggota";
import Kalender from "@/modal/Proyek/Kalender";
import Label from "@/modal/Proyek/Label";
import Checklist from "@/modal/Proyek/Checklist";

const initialState = {
    tambahAnggota: false,
    checklist: false,
    label: false,
    waktu: false,
    lampiran: false,
    addChecklistId: null,
    newItemText: "",
    checklistItems: [],
    loading: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "TOGGLE_TAMBAH_ANGGOTA":
            return { ...state, tambahAnggota: !state.tambahAnggota };
        case "TOGGLE_CHECKLIST":
            return { ...state, checklist: !state.checklist };
        case "TOGGLE_LABEL":
            return { ...state, label: !state.label };
        case "TOGGLE_WAKTU":
            return { ...state, waktu: !state.waktu };
        case "TOGGLE_LAMPIRAN":
            return { ...state, lampiran: !state.lampiran };
        case "START_ADDING":
            return {
                ...state,
                addChecklistId: action.payload.id,
                newItemText: "",
            };
        case "UPDATE_NEW_ITEM_TEXT":
            return { ...state, newItemText: action.payload.text };
        case "FINISH_ADDING":
            return { ...state, addChecklistId: null, newItemText: "" };
        case "TOGGLE_CHECKLIST_ITEM":
            return {
                ...state,
                checklistItems: state.checklistItems.map((title) => ({
                    ...title,
                    checklist_card: title.checklist_card.map((check) =>
                        check.id === action.payload.checklistId
                            ? { ...check, is_checked: !check.is_checked }
                            : check
                    ),
                })),
            };
        case "SET_INITIAL_CHECKLISTS":
            return { ...state, checklistItems: action.payload.checklists };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

export default function Card_kanban() {
    // user
    const user = usePage().props.auth.user;
    const {
        role,
        id_tim,
        card_id,
        anggota_card,
        kalender,
        label_card,
        label_tim,
        id_board,
        dataCard,
        title_checklist,
        checklist: checklistProps,
        flash,
    } = usePage().props;

    const refs = useRef({});
    const [state, dispatch] = useReducer(reducer, initialState);
    const newItemInputRef = useRef({});

    let date = "";
    let fullDate = "";

    // Fix: Use checklistProps instead of undefined checklist variable
    useEffect(() => {
        if (checklistProps) {
            dispatch({
                type: "SET_INITIAL_CHECKLISTS",
                payload: { checklists: checklistProps },
            });
        }
    }, [checklistProps]);

    useEffect(() => {
        if (flash && flash.new_checklist) {
            dispatch({
                type: "START_ADDING",
                payload: { id: flash.new_checklist },
            });
        }
    }, [flash]);

    useEffect(() => {
        if (state.addChecklistId && newItemInputRef.current[state.addChecklistId]) {
            setTimeout(() => {
                newItemInputRef.current[state.addChecklistId].focus();
            }, 100);
        }
    }, [state.addChecklistId]);

    const handleSaveNewItem = (title_checklist_id) => {

        if (!state.newItemText.trim()) return;
        dispatch({ type: "SET_LOADING", payload: true });

        router.post(
            route("store.item.checklist", { id: user.id, id_card: card_id }),
            {
                title_checklist_id: title_checklist_id,
                item_text: state.newItemText,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    dispatch({ type: "FINISH_ADDING" });
                },
                onFinish: () => {
                    dispatch({ type: "SET_LOADING", payload: false });
                },
                onError: (error) => {
                    dispatch({ type: "SET_LOADING", payload: false });
                    console.log(error);
                },
            }
        );
    };

    if (kalender) {
        date = new Date(kalender.due_date);
        fullDate = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    const handleCheckboxChange = async (e, checklistId) => {
        const isChecked = e.target.checked;

        dispatch({ type: "TOGGLE_CHECKLIST_ITEM", payload: { checklistId } });
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            const endpoint = isChecked
                ? route("update.checklist.check", {
                      id: user.id,
                      checklist_id: checklistId,
                  })
                : route("update.checklist.notcheck", {
                      id: user.id,
                      checklist_id: checklistId,
                  });

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    is_checked: isChecked,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Error updating checklist item:", error);
            // Revert the optimistic update on error
            dispatch({
                type: "TOGGLE_CHECKLIST_ITEM",
                payload: { checklistId },
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    // REALTIME LISTENER
    useEffect(() => {
        if (!id_board) return;

        const channel = window.Echo.private(`board.${id_board}`);
        channel.listen(".board.updated", (event) => {
            router.reload({
                only: ["label_card", "label_tim", "anggota_card", "kalender", "checklist"],
                preserveState: true,
                preserveScroll: true,
            });
        });

        return () => {
            window.Echo.leave(`board.${id_board}`);
        };
    }, [id_board]);

    const buttonFitur = [
        {
            name: "Tambah",
            icon: <Plus size={14} />,
            onclick: () => console.log("Tambah klik"),
            show: true,
            active: false,
        },
        {
            name: "Checklist",
            icon: <SquareCheck size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_CHECKLIST" }),
            show: true,
            active: state.checklist,
        },
        {
            name: "Label",
            icon: <Tag size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_LABEL" }),
            show: true,
            active: state.label,
        },
        {
            name: "Waktu",
            icon: <CalendarDays size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_WAKTU" }),
            show: true,
            active: state.waktu,
        },
        {
            name: "Anggota",
            icon: <UserRoundPlus size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_TAMBAH_ANGGOTA" }),
            show: role !== "Member",
            active: state.tambahAnggota,
        },
        {
            name: "Lampiran",
            icon: <Paperclip size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_LAMPIRAN" }),
            show: true,
            active: state.lampiran,
        },
    ];

    // ref lihat card
    const lihatCardRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                lihatCardRef.current &&
                !lihatCardRef.current.contains(e.target)
            ) {
                router.visit(
                    route("proyek", {
                        id: user.id,
                        id_tim: id_tim,
                        id_board: id_board,
                    })
                );
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [user.id, id_tim, id_board]);

    // State untuk toggle dan isi deskripsi
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(
        dataCard?.description ||
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sint hic veritatis sapiente!"
    );

    // State baru untuk komentar
    const [isCommenting, setIsCommenting] = useState(false);
    const [comment, setComment] = useState("");

    // Fungsi untuk menyimpan komentar
    const handleSaveComment = () => {
        if (!comment.trim()) return;
        console.log("Komentar disimpan:", comment);
        // TODO: Send comment to backend
        setComment("");
        setIsCommenting(false);
    };

    return (
        <Proyek>
            <div className="w-screen h-screen fixed top-0 left-0 bg-black/20 flex justify-center items-center z-50">
                <div
                    ref={lihatCardRef}
                    className="rounded-xl bg-white w-full max-w-[90%] h-auto max-h-[95vh] lg:w-[80%] lg:h-[90%] flex flex-col overflow-hidden"
                >
                    {/* Close Button */}
                    <div className="flex justify-end p-1 m-2">
                        <div
                            className="p-1 hover:bg-black/20 rounded-md cursor-pointer"
                            onClick={() =>
                                router.visit(
                                    route("proyek", {
                                        id: user.id,
                                        id_tim: id_tim,
                                        id_board: id_board,
                                    })
                                )
                            }
                        >
                            <X />
                        </div>
                    </div>

                    {/* Judul */}
                    <div className="pb-2 border-b-2 px-4 border-b-gray-200">
                        <h1 className="font-bold text-xl">
                            {dataCard?.nama_card}
                        </h1>
                    </div>

                    {/* Konten */}
                    <div className="px-4 flex-1 flex flex-col lg:flex-row overflow-y-auto gap-4">
                        {/* Konten Kiri */}
                        <div className="flex flex-col gap-4 w-full py-4 lg:w-1/2 border-r-0 lg:border-r-2 border-gray-200 pr-0 lg:pr-4 overflow-y-auto my-scrollable-element">
                            {/* Deskripsi */}
                            <div className="px-2 border border-gray-200 py-3 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex gap-2 items-center">
                                        <Captions />
                                        <h1 className="font-bold text-xl">
                                            Deskripsi
                                        </h1>
                                    </div>
                                    {!isEditing ? (
                                        <div
                                            onClick={() => setIsEditing(true)}
                                            className="flex gap-2 items-center p-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                                        >
                                            <Pencil size={14} />
                                            <p className="text-sm">Edit</p>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditing(false)}
                                            className="flex gap-2 items-center p-2 bg-green-200 rounded-lg hover:bg-green-300 cursor-pointer"
                                        >
                                            <Save size={14} />
                                            <p className="text-sm">Simpan</p>
                                        </div>
                                    )}
                                </div>

                                {/* Isi Deskripsi */}
                                <div className="mt-2 px-1">
                                    {isEditing ? (
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={description}
                                            onChange={(event, editor) => {
                                                const data = editor.getData();
                                                setDescription(data);
                                            }}
                                        />
                                    ) : (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: description,
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex gap-3 mt-4 text-sm flex-wrap relative">
                                {buttonFitur
                                    .filter((btn) => btn.show)
                                    .map((btn, i) => (
                                        <div
                                            ref={(el) =>
                                                (refs.current[btn.name] = el)
                                            }
                                            key={i}
                                            onClick={btn.onclick}
                                            className={`flex gap-2 items-center p-2 ${
                                                btn.active
                                                    ? "bg-gray-600 text-white"
                                                    : "bg-gray-200"
                                            } rounded-md cursor-pointer hover:bg-gray-300`}
                                        >
                                            {btn.icon}
                                            <p>{btn.name}</p>
                                        </div>
                                    ))}

                                {state.tambahAnggota && (
                                    <TambahAnggota
                                        close={() =>
                                            dispatch({
                                                type: "TOGGLE_TAMBAH_ANGGOTA",
                                            })
                                        }
                                        card_id={card_id}
                                        id_tim={id_tim}
                                        refTrigger={refs.current["Anggota"]}
                                    />
                                )}
                                {state.waktu && (
                                    <Kalender
                                        close={() =>
                                            dispatch({ type: "TOGGLE_WAKTU" })
                                        }
                                        refTrigger={refs.current["Waktu"]}
                                        card_id={card_id}
                                    />
                                )}
                                {state.label && (
                                    <Label
                                        close={() =>
                                            dispatch({ type: "TOGGLE_LABEL" })
                                        }
                                        refTrigger={refs.current["Label"]}
                                        card_id={card_id}
                                        id_tim={id_tim}
                                        label_tim_prop={label_tim}
                                        label_card_prop={label_card}
                                    />
                                )}
                                {state.checklist && (
                                    <Checklist
                                        close={() =>
                                            dispatch({
                                                type: "TOGGLE_CHECKLIST",
                                            })
                                        }
                                        card_id={card_id}
                                        id_tim={id_tim}
                                        refTrigger={refs.current["Checklist"]}
                                        title_check={title_checklist}
                                    />
                                )}
                            </div>

                            {/* Label Section */}
                            {label_card && label_card.length > 0 && (
                                <div className="mt-4">
                                    <h1 className="font-semibold text-gray-800">
                                        Label
                                    </h1>
                                    <div className="grid grid-cols-5 gap-10">
                                        {label_card.map((label, i) => (
                                            <div
                                                key={i}
                                                className="w-[100px] min-h-[5px] hover:p-2 rounded-md group transition-all ease-in-out duration-150 cursor-pointer"
                                                style={{
                                                    backgroundColor:
                                                        label.warna,
                                                }}
                                            >
                                                <p className="group-hover:flex hidden">
                                                    {label.title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Anggota Section */}
                            <div className="flex flex-col gap-1 mt-4">
                                <h4 className="text-[14px] text-gray-700">
                                    Anggota
                                </h4>
                                <div className="flex gap-1 items-center">
                                    {anggota_card &&
                                        anggota_card.map((data, i) => (
                                            <div
                                                key={i}
                                                className="w-6 h-6 rounded-full overflow-hidden"
                                            >
                                                {data.image ? (
                                                    <img
                                                        src={`/storage/${data.image}`}
                                                        alt={data.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-blue-500 flex justify-center items-center text-white text-xs">
                                                        <p>
                                                            {data.name.charAt(
                                                                0
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    <div className="w-6 h-6 flex justify-center items-center cursor-pointer">
                                        <Plus
                                            onClick={() =>
                                                dispatch({
                                                    type: "TOGGLE_TAMBAH_ANGGOTA",
                                                })
                                            }
                                            size={14}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kalender Section */}
                            {kalender && (
                                <div className="text-gray-800">
                                    <h1 className="font-semibold">
                                        Tenggat Waktu
                                    </h1>
                                    <div
                                        onClick={() =>
                                            dispatch({
                                                type: "TOGGLE_WAKTU",
                                            })
                                        }
                                        className="flex gap-2 items-center p-2 bg-gray-200 w-fit rounded-md cursor-pointer"
                                    >
                                        <CalendarDays size={20} />
                                        <p>
                                            {fullDate} jam: {kalender.due_time}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Lampiran Section */}
                            <div className="border border-gray-200 py-3 px-2 rounded-md mt-4">
                                <div className="flex items-center gap-2">
                                    <Paperclip size={14} />
                                    <h1>Lampiran</h1>
                                </div>
                                <div className="w-[200px] h-[200px] flex justify-center items-center px-4">
                                    <img
                                        src="/img/img_proyek.png"
                                        alt="lampiran"
                                        className="w-full object-cover"
                                    />
                                </div>
                            </div>
                            {/* CHECKLIST Section */}
                            {state.checklistItems.length > 0 && (
                                <div className="p-2">
                                    {state.checklistItems.map((title) => {
                                        const totalItems = title.checklist_card.length;
                                        const completedItems = title.checklist_card.filter((item) => item.is_checked).length;
                                        const progresPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                                        return (
                                            <div
                                                key={title.id}
                                                className="mt-4"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <SquareCheck
                                                            size={14}
                                                        />
                                                        <span className="text-lg text-gray-700 font-semibold">
                                                            {title.title}
                                                        </span>
                                                    </div>
                                                    <div
                                                        onClick={() =>
                                                            router.delete(
                                                                route(
                                                                    "delete.title.checklist",
                                                                    {
                                                                        id: user.id,
                                                                        id_checklist:
                                                                            title.id,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                        className="text-red-500 cursor-pointer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </div>
                                                </div>
                                                {totalItems > 0 && (
                                                    <div className="flex items-center gap-2 mt-2 px-1">
                                                        <span className="text-xs font-semibold w-8 text-right">
                                                            {Math.round(
                                                                progresPercentage
                                                            )}
                                                            %
                                                        </span>
                                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                                            <div
                                                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${progresPercentage}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-4 mt-2 p-4">
                                                    {title.checklist_card &&
                                                    title.checklist_card
                                                        .length > 0 ? (
                                                        title.checklist_card.map(
                                                            (check) => (
                                                                <div
                                                                    key={
                                                                        check.id
                                                                    }
                                                                    className="space-x-2 flex items-center"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded"
                                                                        checked={
                                                                            !!check.is_checked
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleCheckboxChange(
                                                                                e,
                                                                                check.id
                                                                            )
                                                                        }
                                                                    />
                                                                    <span>
                                                                        {
                                                                            check.title
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center text-gray-400 gap-2">
                                                                <CopyCheck
                                                                    size={20}
                                                                />
                                                                <p>
                                                                    Belum ada
                                                                    checklist
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3">
                                                    {state.addChecklistId ===
                                                    title.id ? (
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                type="text"
                                                                ref={(el) =>
                                                                    (newItemInputRef.current[
                                                                        title.id
                                                                    ] = el)
                                                                }
                                                                value={
                                                                    state.newItemText
                                                                }
                                                                onChange={(e) =>
                                                                    dispatch({
                                                                        type: "UPDATE_NEW_ITEM_TEXT",
                                                                        payload:
                                                                            {
                                                                                text: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                    })
                                                                }
                                                                onKeyDown={(
                                                                    e
                                                                ) =>
                                                                    e.key ===
                                                                        "Enter" &&
                                                                    handleSaveNewItem(
                                                                        title.id
                                                                    )
                                                                }
                                                                placeholder="Tambahkan item..."
                                                                className="w-full text-sm rounded-md h-9 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleSaveNewItem(
                                                                            title.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        state.loading
                                                                    }
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                                                                >
                                                                    {state.loading
                                                                        ? "Menyimpan..."
                                                                        : "Simpan"}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        dispatch(
                                                                            {
                                                                                type: "FINISH_ADDING",
                                                                            }
                                                                        )
                                                                    }
                                                                    className="px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
                                                                >
                                                                    Batal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="px-4">
                                                            <button
                                                                onClick={() =>
                                                                    dispatch({
                                                                        type: "START_ADDING",
                                                                        payload:
                                                                            {
                                                                                id: title.id,
                                                                            },
                                                                    })
                                                                }
                                                                className="p-2 text-xs bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400"
                                                            >
                                                                Tambah Checklist
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Konten Kanan - Comments Section */}
                        <div className="w-full lg:w-1/2 px-0 lg:px-4 my-4">
                            <div className="flex gap-2 items-center mb-4">
                                <MessageSquareText />
                                <p className="font-bold text-lg">Komentar</p>
                            </div>

                            {!isCommenting ? (
                                <div
                                    onClick={() => setIsCommenting(true)}
                                    className="mt-2 p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer text-gray-500"
                                >
                                    <p>Tulis komentar...</p>
                                </div>
                            ) : (
                                <div>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={comment}
                                        onChange={(event, editor) =>
                                            setComment(editor.getData())
                                        }
                                    />
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={handleSaveComment}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsCommenting(false);
                                                setComment("");
                                            }}
                                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Example Comment */}
                            <div className="mt-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 mt-1 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                                        A
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">Angga</p>
                                        <div className="prose prose-sm max-w-none bg-gray-100 p-2 rounded-md">
                                            <p>
                                                Ini adalah contoh komentar yang
                                                sudah ada.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}
