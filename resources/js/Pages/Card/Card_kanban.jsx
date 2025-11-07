import { useEffect, useReducer, useRef, useState } from "react";
import {
    CalendarDays,
    Captions,
    Check,
    CopyCheck,
    Download,
    EllipsisIcon,
    File as FileIcon,
    MessageCircleMore,
    MessageSquareText,
    Paperclip,
    Pencil,
    Plus,
    SquareCheck,
    SquarePen,
    Tag,
    Trash2,
    UserRoundPlus,
    X,
} from "lucide-react";
import { Head, router, usePage } from "@inertiajs/react";
import Proyek from "../Proyek";
import TambahAnggota from "@/modal/Proyek/TambahAnggota";
import Kalender from "@/modal/Proyek/Kalender";
import Label from "@/modal/Proyek/Label";
import Checklist from "@/modal/Proyek/Checklist";
import InputEditor from "@/Components/InputEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Lampiran from "@/modal/Proyek/Lampiran";
import InputChecklist from "@/Components/InputChecklist";
import ElipsisModal from "@/Components/ElipsisModal";
import KomponenKomentar from "@/Components/KomponenKomentar";

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
    uploadingPhoto: null,
    photoError: null,
    inputCheck: null,
    modalElipsis: null,
    isCommenting: false,
    editKomentar: null,
    mention: null,
    mention_id: null,
    komentarValue: "",
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
        case "ELIPSIS_MODAL":
            return { ...state, modalElipsis: action.payload };
        case "TOGGLE_INPUT_CHECKLIST":
            return { ...state, inputCheck: action.payload };
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
        case "SET_UPLOADING_FILE":
            return {
                ...state,
                uploadingPhoto: action.payload.checklistId
                    ? action.payload.checklistId
                    : null,
            };
        case "SET_FILE_ERROR":
            return {
                ...state,
                photoError: action.payload.error,
                uploadingPhoto: null, // Pastikan di-null agar error bisa tampil
            };
        case "CLEAR_FILE_ERROR":
            return { ...state, photoError: null };
        case "START_KOMENTAR":
            return { ...state, isCommenting: action.payload };
        case "KOMENTAR_MENTION":
            return {
                ...state,
                isCommenting: action.payload.isCommenting,
                mention: action.payload.mention,
                komentarValue: action.payload.komentarValue,
                mention_id: action.payload.mention_id,
            };
        case "SET_KOMENTAR_VALUE":
            return { ...state, komentarValue: action.payload };
        case "BATAL_KOMENTAR":
            return {
                ...state,
                isCommenting: false,
                komentarValue: "",
                mention: null,
            };
        case "EDIT":
            return { ...state, editKomentar: action.payload };
        default:
            return state;
    }
}

export default function Card_kanban() {
    const user = usePage().props.auth.user;
    const {
        id,
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
        deskripsi,
        lampiran_card,
        komentar,
    } = usePage().props;

    const refs = useRef({});
    const [state, dispatch] = useReducer(reducer, initialState);
    const newItemInputRef = useRef({});
    const triggerRefs = useRef({});

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(dataCard?.nama_card || "");
    const titleInputRef = useRef(null);

    let date = "";
    let fullDate = "";

    useEffect(() => {
        if (checklistProps) {
            dispatch({
                type: "SET_INITIAL_CHECKLISTS",
                payload: { checklists: checklistProps },
            });
        }
    }, [checklistProps]);

    useEffect(() => {
        if (!isEditingTitle) {
            setCurrentTitle(dataCard?.nama_card || "");
        }
    }, [dataCard, isEditingTitle]);

    // Fokus ke input saat mode edit aktif
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleTitleSave = () => {
        if (!currentTitle.trim() || currentTitle === dataCard?.nama_card) {
            setIsEditingTitle(false);
            setCurrentTitle(dataCard?.nama_card || ""); 
            return;
        }

        router.put(
            route("proyek.card.update.title", { id: user.id, cardId: card_id }),
            { nama_card: currentTitle },
            {
                preserveScroll: true,
                onSuccess: () => setIsEditingTitle(false),
                onError: (errors) => {
                    console.error(errors);
                    setCurrentTitle(dataCard?.nama_card || ""); 
                    setIsEditingTitle(false);
                }
            }
        );
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        }
        if (e.key === 'Escape') {
            setIsEditingTitle(false);
            setCurrentTitle(dataCard?.nama_card || "");
        }
    };

    useEffect(() => {
        if (flash && flash.new_checklist) {
            dispatch({
                type: "START_ADDING",
                payload: { id: flash.new_checklist },
            });
        }
    }, [flash]);

    useEffect(() => {
        if (
            state.addChecklistId &&
            newItemInputRef.current[state.addChecklistId]
        ) {
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
    
    const handleFileUpload = async (event, checklistId) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Bersihkan error sebelumnya untuk item ini
        dispatch({ type: "CLEAR_FILE_ERROR" });
        dispatch({ type: "SET_UPLOADING_FILE", payload: { checklistId } });

        const allowedTypes = [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "text/csv",
        ];
        if (!allowedTypes.includes(file.type)) {
            dispatch({
                type: "SET_FILE_ERROR",
                payload: {
                    error: "Tipe file tidak didukung (hanya gambar, pdf, doc, xlsx, csv).",
                },
            });
            return;
        }

        const maxSize = 5 * 1024 * 1024; 
        if (file.size > maxSize) {
            dispatch({
                type: "SET_FILE_ERROR",
                payload: { error: "Ukuran file tidak boleh lebih dari 5MB" },
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("checklist_id", checklistId);

            const response = await fetch(
                route("upload.checklist.file", {
                    id: user.id,
                    checklist_id: checklistId,
                }),
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal mengupload file");
            }

            router.reload({
                only: ["checklist"],
                preserveState: true,
                preserveScroll: true,
            });

        } catch (error) {
            console.error("Error uploading file:", error);
            dispatch({
                type: "SET_FILE_ERROR",
                payload: { error: error.message },
            });
        } finally {
            dispatch({
                type: "SET_UPLOADING_FILE",
                payload: { checklistId: null }, // Selesai uploading, baik sukses atau gagal
            });
            event.target.value = "";
        }
    };

    const handleSaveDeskripsi = () => {
        dispatch({ type: "SET_LOADING", payload: true });

        router.post(
            route("store.deskripsi", { id: user.id, id_card: card_id }),
            {
                deskripsi: description,
                id_deskripsi: deskripsi?.id,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    setIsEditing(false);
                },
                onFinish: () => {
                    dispatch({ type: "SET_LOADING", payload: false });
                },
            }
        );
    };

    const handleCheckboxChange = async (e, checklistId) => {
        const isChecked = e.target.checked;

        dispatch({ type: "TOGGLE_CHECKLIST_ITEM", payload: { checklistId } });
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            const endpoint = isChecked
                ? route("update.checklist.check", { id: user.id, checklist_id: checklistId })
                : route("update.checklist.notcheck", { id: user.id, checklist_id: checklistId });

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ is_checked: isChecked }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Error updating checklist item:", error);
            dispatch({ type: "TOGGLE_CHECKLIST_ITEM", payload: { checklistId } });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    useEffect(() => {
        if (!id_board) return;

        const channel = window.Echo.private(`board.${id_board}`);
        channel.listen(".board.updated", (event) => {
            router.reload({
                only: ["dataCard", "label_card", "label_tim", "anggota_card", "kalender", "checklist", "lampiran_card", "komentar"],
                preserveState: true,
                preserveScroll: true,
            });
        });

        return () => {
            window.Echo.leave(`board.${id_board}`);
        };
    }, [id_board]);

    const buttonFitur = [
        { name: "Checklist", icon: <SquareCheck size={14} />, onclick: () => dispatch({ type: "TOGGLE_CHECKLIST" }), show: true, active: state.checklist },
        { name: "Label", icon: <Tag size={14} />, onclick: () => dispatch({ type: "TOGGLE_LABEL" }), show: true, active: state.label },
        { name: "Waktu", icon: <CalendarDays size={14} />, onclick: () => dispatch({ type: "TOGGLE_WAKTU" }), show: true, active: state.waktu },
        { name: "Anggota", icon: <UserRoundPlus size={14} />, onclick: () => dispatch({ type: "TOGGLE_TAMBAH_ANGGOTA" }), show: role !== "Member", active: state.tambahAnggota },
        { name: "Lampiran", icon: <Paperclip size={14} />, onclick: () => dispatch({ type: "TOGGLE_LAMPIRAN" }), show: true, active: state.lampiran },
    ];

    const lihatCardRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (isEditingTitle) return;
            
            if (lihatCardRef.current && !lihatCardRef.current.contains(e.target)) {
                router.visit(route("proyek", { id: user.id, id_tim: id_tim, id_board: id_board }));
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [user.id, id_tim, id_board, isEditingTitle]); 

    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(deskripsi?.deskripsi || "");
    const [editingLampiranId, setEditingLampiranId] = useState(null);
    const [editValues, setEditValues] = useState({ judul: "", deskripsi: "", image: null });

    const lampiranComment = (lampiran_judul, mention_id) => {
        dispatch({
            type: "KOMENTAR_MENTION",
            payload: { isCommenting: true, mention: lampiran_judul, komentarValue: state.komentarValue, mention_id: mention_id },
        });
    };

    const balasKomentar = (komentar) => {
        dispatch({
            type: "KOMENTAR_MENTION",
            payload: { isCommenting: true, mention: komentar.user_name, komentarValue: state.komentarValue, mention_id: komentar.id },
        });
    };

    const editKomentar = (komentar) => {
        dispatch({
            type: "KOMENTAR_MENTION",
            payload: { isCommenting: true, mention: komentar.mention || null, komentarValue: komentar.komentar, mention_id: komentar.parent_id || komentar.lampiran_id },
        });
        dispatch({ type: "EDIT", payload: komentar.id });
    };

    const handleKomentar = () => {
        let finalKomentar = state.komentarValue || "";
        if (state.mention && finalKomentar.startsWith(state.mention)) {
            finalKomentar = finalKomentar.substring(state.mention.length).trim();
        }

        const payload = {
            komentar: finalKomentar,
            mention: state.mention,
            ...(state.mention_id && { mention_id: state.mention_id }),
            ...(state.editKomentar && { edit_komentar: state.editKomentar }),
        };

        dispatch({ type: "SET_LOADING", payload: true });

        const requestOptions = {
            preserveState: true,
            onSuccess: () => dispatch({ type: "BATAL_KOMENTAR" }),
            onFinish: () => dispatch({ type: "SET_LOADING", payload: false }),
        };

        if (!state.editKomentar) {
            router.post(route("komentar", { id: user.id, id_card: card_id }), payload, requestOptions);
        } else {
            router.put(route("edit.komentar", { id: user.id, id_card: card_id }), payload, requestOptions);
        }
    };

    const handleEditClick = (lampiran) => {
        setEditingLampiranId(lampiran.id);
        setEditValues({ judul: lampiran.judul, deskripsi: lampiran.deskripsi || "", image: null });
    };

    const handleEditChange = (e) => setEditValues({ ...editValues, [e.target.name]: e.target.value });
    const handleEditFileChange = (e) => setEditValues({ ...editValues, image: e.target.files[0] });
    const handleCancelEdit = () => setEditingLampiranId(null);

    const handleUpdateSubmit = (e, lampiranId) => {
        e.preventDefault();
        router.post(
            route("lampiran.update", { id: id, lampiran_id: lampiranId }),
            { ...editValues, _method: "PUT" },
            { onSuccess: () => setEditingLampiranId(null), preserveScroll: true }
        );
    };

    const handleDeleteLampiran = (lampiranId) => {
        if (confirm("Anda yakin ingin menghapus lampiran ini?")) {
            router.delete(route("lampiran.destroy", { id: id, lampiran_id: lampiranId }), { preserveScroll: true });
        }
    };

    const formatRelativeTime = (isoDate) => {
        const seconds = Math.round((new Date() - new Date(isoDate)) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return `${seconds} detik yang lalu`;
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        return `${days} hari yang lalu`;
    };
    
    const renderChecklistFilePreview = (check) => {
        const fileUrl = `/storage/${check.image}`;
        const fileExt = check.image.split(".").pop().toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="Lihat gambar">
                    <img src={fileUrl} alt="Pratinjau checklist" className="w-full h-full object-cover rounded"/>
                </a>
            );
        }

        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="Lihat file" className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                 <FileIcon className="text-gray-400" size={32} />
            </a>
        );
    };

    const renderAttachmentPreview = (lampiran) => {
        const fileExt = lampiran.image.split(".").pop().toLowerCase();
        const fileUrl = `/storage/${lampiran.image}`;

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
            return <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block"><img src={fileUrl} alt={lampiran.judul} className="w-full h-full object-cover"/></a>;
        }

        if (fileExt === "pdf") {
            return <div><iframe src={fileUrl} className="w-full border rounded" title={lampiran.judul}/><a href={fileUrl} target="_blank" rel="noopener noreferrer"><div className="w-full text-center p-1 text-xs bg-gray-300 rounded mt-4">Lihat</div></a></div>;
        }

        return <div className="w-full h-full bg-gray-100 flex items-center justify-center"><FileIcon className="text-gray-400" size={48} /></div>;
    };

    return (
        <Proyek>
            <Head title="Card"/>
            <div className="w-screen h-screen fixed top-0 left-0 bg-black/20 flex justify-center items-center z-50 ">
                <div ref={lihatCardRef} className="rounded-xl bg-white w-full max-w-[90%] h-auto max-h-[95vh] lg:w-[80%] lg:h-[90%] flex flex-col overflow-hidden relative">
                    <div className="flex justify-end absolute top-2 right-2">
                        <div className="p-1 hover:bg-black/20 rounded-md cursor-pointer" onClick={() => router.visit(route("proyek", { id: user.id, id_tim: id_tim, id_board: id_board }))}>
                            <X />
                        </div>
                    </div>
                
                    <div className="p-4 border px-4 border-b-gray-200">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    ref={titleInputRef}
                                    type="text"
                                    value={currentTitle}
                                    onChange={(e) => setCurrentTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={handleTitleKeyDown}
                                    className="font-bold text-xl w-90% rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
                                />
                                <button
                                    onClick={handleTitleSave}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm px-3"
                                >
                                    Simpan
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingTitle(false);
                                        setCurrentTitle(dataCard?.nama_card || "");
                                    }}
                                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group min-h-[40px] -ml-1">
                                <h1 
                                    className="font-bold text-xl rounded-md px-1 py-1 cursor-pointer hover:bg-gray-100"
                                    onClick={() => setIsEditingTitle(true)}
                                >
                                    {currentTitle}
                                </h1>
                                <SquarePen
                                    size={18}
                                    className="text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setIsEditingTitle(true)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="px-4 flex-1 flex flex-col lg:flex-row overflow-y-auto gap-4">
                        <div className="flex flex-col gap-4 w-full py-4 lg:w-1/2 border-r-0 lg:border-r-2 border-gray-200 pr-0 lg:pr-4 overflow-y-auto my-scrollable-element">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                    <Captions />
                                    <h1 className="font-bold text-xl">Deskripsi</h1>
                                </div>
                                <div onClick={() => setIsEditing(true)} className="flex gap-2 items-center p-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer">
                                    <Pencil size={14} />
                                    <p className="text-sm">Edit</p>
                                </div>
                            </div>
                            <div className="px-2 border border-gray-200 py-3 rounded-lg">
                                <div className="px-1">
                                    {isEditing ? (
                                        <InputEditor anggota_card={anggota_card} close={() => setIsEditing(false)} onChange={setDescription} value={description} onSave={handleSaveDeskripsi} loading={state.loading} placeholder={"Deskripsi"} />
                                    ) : description && description.trim() !== "" ? (
                                        <div className="prose max-w-none prose-ul:pl-6 prose-ol:pl-6 prose-li:marker:text-gray-700">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Belum ada deskripsi.</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4 text-sm flex-wrap relative">
                                {buttonFitur.filter((btn) => btn.show).map((btn, i) => (
                                    <div ref={(el) => (refs.current[btn.name] = el)} key={i} onClick={btn.onclick} className={`flex gap-2 items-center p-2 ${btn.active ? "bg-gray-600 text-white" : "bg-gray-200"} rounded-md cursor-pointer hover:bg-gray-300`}>
                                        {btn.icon}
                                        <p>{btn.name}</p>
                                    </div>
                                ))}
                                {state.tambahAnggota && <TambahAnggota close={() => dispatch({ type: "TOGGLE_TAMBAH_ANGGOTA" })} card_id={card_id} id_tim={id_tim} refTrigger={refs.current["Anggota"]} />}
                                {state.waktu && <Kalender close={() => dispatch({ type: "TOGGLE_WAKTU" })} refTrigger={refs.current["Waktu"]} card_id={card_id} />}
                                {state.label && <Label close={() => dispatch({ type: "TOGGLE_LABEL" })} refTrigger={refs.current["Label"]} card_id={card_id} id_tim={id_tim} label_tim_prop={label_tim} label_card_prop={label_card} />}
                                {state.checklist && <Checklist close={() => dispatch({ type: "TOGGLE_CHECKLIST" })} card_id={card_id} id_tim={id_tim} refTrigger={refs.current["Checklist"]} title_check={title_checklist} />}
                                {state.lampiran && <Lampiran close={() => dispatch({ type: "TOGGLE_LAMPIRAN" })} card_id={card_id} id_tim={id_tim} refTrigger={refs.current["Lampiran"]} />}
                            </div>
                            {label_card && label_card.length > 0 && (
                                <div className="mt-4">
                                    <h1 className="font-semibold text-gray-800">Label</h1>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {label_card.map((label, i) => (<div key={i} className="px-3 py-1 text-sm rounded-md" style={{ backgroundColor: label.warna, color: '#fff' }}>{label.title}</div>))}
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-1 mt-4">
                                <h4 className="text-[14px] text-gray-700">Anggota</h4>
                                <div className="flex gap-1 items-center">
                                    {anggota_card && anggota_card.map((data, i) => (<div key={i} className="w-6 h-6 rounded-full overflow-hidden">{data.image ? <img src={`/storage/${data.image}`} alt={data.name} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-blue-500 flex justify-center items-center text-white text-xs"><p>{data.name.charAt(0)}</p></div>}</div>))}
                                    <div className="w-6 h-6 flex justify-center items-center cursor-pointer"><Plus onClick={() => dispatch({ type: "TOGGLE_TAMBAH_ANGGOTA" })} size={14} /></div>
                                </div>
                            </div>
                            {kalender && (
                                <div className="text-gray-800">
                                    <h1 className="font-semibold">Tenggat Waktu</h1>
                                    <div onClick={() => dispatch({ type: "TOGGLE_WAKTU" })} className="flex gap-2 items-center p-2 bg-gray-200 w-fit rounded-md cursor-pointer">
                                        <CalendarDays size={20} /><p>{fullDate} jam: {kalender.due_time}</p>
                                    </div>
                                </div>
                            )}
                            {lampiran_card && lampiran_card.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 py-4"><Paperclip size={14} /><h1>Lampiran</h1></div>
                                    {lampiran_card.map((lampiran) => (
                                        <div key={lampiran.id} className="border border-gray-200 rounded p-4 mb-4">
                                            {editingLampiranId === lampiran.id ? (
                                                <form onSubmit={(e) => handleUpdateSubmit(e, lampiran.id)} className="flex flex-col gap-3">
                                                    <div>
                                                        <input type="text" name="judul" value={editValues.judul} placeholder="judul..." onChange={handleEditChange} className="font-semibold text-gray-800 text-lg w-full rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-2 py-1" autoFocus/>
                                                        <textarea name="deskripsi" value={editValues.deskripsi} onChange={handleEditChange} placeholder="deskripsi..." className="text-gray-800 text-sm w-full mt-2 h-20 resize-none border rounded p-2 focus:ring-blue-500 focus:border-blue-500"/>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <label htmlFor={`edit-file-${lampiran.id}`} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-1.5 cursor-pointer transition-colors">
                                                                <Paperclip size={14}/><span>Ganti File</span>
                                                            </label>
                                                            <input id={`edit-file-${lampiran.id}`} type="file" onChange={handleEditFileChange} className="hidden"/>
                                                            {editValues.image && (<span className="text-xs text-gray-500 truncate max-w-xs">{editValues.image.name}</span>)}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={handleCancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors">Batal</button>
                                                            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"><Check size={16}/>Simpan</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="pb-1 flex justify-between items-start">
                                                        <div>
                                                            <div>
                                                                <h1 className="font-semibold text-gray-800 text-lg">{lampiran.judul}</h1>
                                                                <p className="text-gray-800 text-sm">{lampiran.deskripsi}</p>
                                                            </div>
                                                            <p className="my-1 text-gray-500 text-xs">{formatRelativeTime(lampiran.created_at)}</p>
                                                        </div>
                                                        <div onClick={() => handleDeleteLampiran(lampiran.id)} className="text-red-500 hover:text-red-700 cursor-pointer p-1 transition-colors">
                                                            <Trash2 size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <div className="w-[200px] max-h-[200px] rounded overflow-hidden flex justify-center items-center">
                                                            {renderAttachmentPreview(lampiran)}
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 font-semibold text-gray-600 flex gap-6">
                                                        <div onClick={() => lampiranComment(lampiran.judul, lampiran.id)} className="flex flex-col items-center w-fit cursor-pointer gap-1">
                                                            <MessageCircleMore size={16}/><span className="text-xs">Comment</span>
                                                        </div>
                                                        <div onClick={() => handleEditClick(lampiran)} className="flex flex-col items-center w-fit cursor-pointer gap-1">
                                                            <SquarePen size={16}/><span className="text-xs">Edit</span>
                                                        </div>
                                                        <a href={`/storage/${lampiran.image}`} download className="flex flex-col items-center w-fit cursor-pointer gap-1 text-gray-600 no-underline">
                                                            <Download size={16}/><span className="text-xs">Download</span>
                                                        </a>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {state.checklistItems.length > 0 && (
                                <div className="p-2">
                                    {state.checklistItems.map((title) => {
                                        const totalItems = title.checklist_card.length;
                                        const completedItems = title.checklist_card.filter((item) => item.is_checked).length;
                                        const progresPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                                        return (
                                            <div key={title.id} className="mt-4 mb-5">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <SquareCheck size={14}/>
                                                        <span className="text-lg text-gray-700 font-semibold">{title.title}</span>
                                                    </div>
                                                    <div onClick={() => router.delete(route("delete.title.checklist", { id: user.id, id_checklist: title.id }))} className="text-red-500 cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </div>
                                                </div>
                                                {totalItems > 0 && (
                                                    <div className="flex items-center gap-2 mt-2 px-1">
                                                        <span className="text-xs font-semibold w-8 text-right">{Math.round(progresPercentage)}%</span>
                                                        <div className="w-full bg-gray-200 rounded-full h-1"><div className="bg-blue-600 h-1 rounded-full transition-all duration-300" style={{ width: `${progresPercentage}%` }}></div></div>
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {title.checklist_card?.map((check) => (
                                                        <div key={check.id} className="group hover:bg-gray-100 p-2 rounded-md">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <input type="checkbox" className="rounded" checked={!!check.is_checked} disabled={state.loading} onChange={(e) => handleCheckboxChange(e, check.id)}/>
                                                                    {state.inputCheck === check.id ? (
                                                                        <InputChecklist close={() => dispatch({ type: "TOGGLE_INPUT_CHECKLIST", payload: null })} value={check.title} id_check={check.id}/>
                                                                    ) : (
                                                                        <span onClick={() => dispatch({ type: "TOGGLE_INPUT_CHECKLIST", payload: check.id })} className={check.is_checked ? "line-through text-gray-500" : ""}>{check.title}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <label htmlFor={`file_upload_${check.id}`} className={`flex items-center gap-2 p-1.5 px-2 text-xs rounded text-white cursor-pointer transition-colors ${state.uploadingPhoto === check.id ? "bg-gray-400 cursor-not-allowed" : check.image ? "bg-green-500 hover:bg-green-600" : "bg-blue-400 hover:bg-blue-500"}`}>
                                                                        <Paperclip size={14} />
                                                                        <span>{state.uploadingPhoto === check.id ? "Mengunggah..." : check.image ? "Ganti File" : "File"}</span>
                                                                    </label>
                                                                    <input id={`file_upload_${check.id}`} className="hidden" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={(e) => handleFileUpload(e, check.id)} disabled={state.uploadingPhoto === check.id}/>
                                                                    <div ref={(el) => (triggerRefs.current[check.id] = el)} className="relative">
                                                                        <div onClick={(e) => { e.stopPropagation(); dispatch({ type: "ELIPSIS_MODAL", payload: state.modalElipsis === check.id ? null : check.id }); }} className="cursor-pointer">
                                                                            <EllipsisIcon size={20} />
                                                                        </div>
                                                                        {state.modalElipsis === check.id ? (
                                                                            <ElipsisModal triggerRef={{ current: triggerRefs.current[check.id] }} close={() => dispatch({ type: "ELIPSIS_MODAL", payload: null })} className="-left-20 top-8">
                                                                                <ul>
                                                                                    <li onClick={() => router.put(route("update.delete.checklist", { id: user.id, id_checklist: check.id }))} className="flex text-sm items-center gap-2 hover:bg-gray-200 p-2 cursor-pointer rounded">
                                                                                        <span>delete</span>
                                                                                        <Trash2 size={16} className="text-red-600"/>
                                                                                    </li>
                                                                                </ul>
                                                                            </ElipsisModal>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {check.image && (
                                                                <div className="mt-2 pl-7 flex items-center gap-3">
                                                                    <div className="w-20 h-20 group relative">
                                                                        {renderChecklistFilePreview(check)}
                                                                        <div onClick={() => router.put(route("delete.image.checklist", { id: user.id, checklist_id: check.id }))} title="Hapus file" className="absolute -top-1 -right-1 hidden group-hover:flex text-red-600 bg-white rounded-full p-0.5 cursor-pointer shadow">
                                                                            <X size={14} />
                                                                        </div>
                                                                    </div>
                                                                    <a href={`/storage/${check.image}`} download title="Download file" className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                                                                        <Download size={18} />
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {/* PERBAIKAN: Menampilkan error upload file */}
                                                            {state.photoError && !state.uploadingPhoto && (
                                                                <p className="text-xs text-red-500 mt-1 pl-7">
                                                                    Error: {state.photoError}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3">
                                                    {state.addChecklistId === title.id ? (
                                                         <div className="flex flex-col gap-2">
                                                            <input type="text" ref={(el) => (newItemInputRef.current[title.id] = el)} value={state.newItemText} onChange={(e) => dispatch({ type: "UPDATE_NEW_ITEM_TEXT", payload: { text: e.target.value } })} onKeyDown={(e) => e.key === "Enter" && handleSaveNewItem(title.id)} placeholder="Tambahkan item..." className="w-full text-sm rounded-md h-9 border-gray-300 focus:ring-blue-500 focus:border-blue-500"/>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleSaveNewItem(title.id)} disabled={state.loading} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{state.loading ? "Menyimpan..." : "Simpan"}</button>
                                                                <button onClick={() => dispatch({ type: "FINISH_ADDING" })} className="px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300">Batal</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="px-4">
                                                            <button onClick={() => dispatch({ type: "START_ADDING", payload: { id: title.id } })} disabled={state.loading} className="p-2 text-xs bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400">{state.loading ? "Loading..." : "Tambah Item"}</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="w-full lg:w-1/2 px-0 lg:px-4 my-4 overflow-y-auto">
                            <div className="flex gap-2 items-center mb-4"><MessageSquareText /><p className="font-bold text-lg">Komentar</p></div>
                            {!state.isCommenting ? (<div onClick={() => dispatch({ type: "START_KOMENTAR", payload: true })} className="mt-2 p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer text-gray-500"><p>Tulis komentar...</p></div>) : (<InputEditor anggota_card={anggota_card} close={() => dispatch({ type: "BATAL_KOMENTAR" })} value={state.komentarValue} loading={state.loading} isCommenting={state.isCommenting} onChange={(val) => dispatch({ type: "SET_KOMENTAR_VALUE", payload: val })} setComment={(val) => dispatch({ type: "SET_KOMENTAR_VALUE", payload: val })} onSave={handleKomentar} placeholder={state.mention ? `Komentari ${state.mention}` : "Komentar"}/>)}
                            <KomponenKomentar komentar={komentar} id_board={id_board} balasKomentar={(val) => balasKomentar(val)} editKomentar={(val) => editKomentar(val)}/>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}