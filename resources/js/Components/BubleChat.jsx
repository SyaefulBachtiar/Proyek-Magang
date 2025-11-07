import { router, usePage } from "@inertiajs/react";
import {
    EllipsisIcon,
    Reply,
    SquarePen,
    Trash2,
    Paperclip, // <-- 1. TAMBAHKAN IMPORT INI
} from "lucide-react";
import { useEffect, useReducer, useRef } from "react";

const initialState = {
    ellipsisChat: "",
    focusPesanBalas: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_ELLIPSIS":
            return { ...state, ellipsisChat: action.payload.ellipsisChat };
        case "PESAN_BALAS":
            return { ...state, focusPesanBalas: action.payload };
        default:
            return state;
    }
}

const OpsiEllipsis = ({
    ellipsisClose,
    triggerRef,
    isOwn,
    auth,
    limit,
    edit_pesan,
    balas_pesan,
    itemChatUser,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                ellipsisClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ellipsisClose, triggerRef]);

    return (
        <div
            ref={modalRef}
            className={`flex flex-col bg-white absolute z-10 rounded shadow-lg border border-gray-200 ${
                isOwn ? "right-0" : "left-0"
            }`}
            style={{
                top: "100%",
                minWidth: "120px",
            }}
        >
            <ul className="p-1">
                {itemChatUser?.sender_id === auth.user.id && !limit ? (
                    <>
                        <li
                            onClick={() =>
                                router.delete(
                                    route("delete.pesan", {
                                        id: auth.user.id,
                                        id_pesan: itemChatUser?.id,
                                    })
                                )
                            }
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            <Trash2 size={14} />
                            <span>Hapus</span>
                        </li>
                        <li
                            onClick={() =>
                                edit_pesan(
                                    itemChatUser?.pesan,
                                    itemChatUser?.id
                                )
                            }
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            <SquarePen size={14} />
                            <span>edit</span>
                        </li>
                    </>
                ) : null}
                <li
                    onClick={() =>
                        balas_pesan(
                            itemChatUser.id,
                            itemChatUser.name,
                            itemChatUser.pesan
                        )
                    }
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                    <Reply size={14} />
                    <span>Balas</span>
                </li>
            </ul>
        </div>
    );
};

export default function BubleChat({ chatting, edit_pesan, balas_pesan }) {
    const { auth } = usePage().props;
    const [state, dispatch] = useReducer(reducer, initialState);
    const triggerRefs = useRef({});
    const messageRefs = useRef({});
    const previousHighlightedRef = useRef(null);

    const handleEllipsisClick = (messageId) => {
        dispatch({
            type: "SET_ELLIPSIS",
            payload: {
                ellipsisChat: state.ellipsisChat === messageId ? "" : messageId,
            },
        });
    };

    const removeHighlight = () => {
        if (previousHighlightedRef.current) {
            previousHighlightedRef.current.classList.remove("bg-yellow-100");
            previousHighlightedRef.current = null;
        }
    };

    useEffect(() => {
        if (
            state.focusPesanBalas &&
            messageRefs.current[state.focusPesanBalas]
        ) {
            removeHighlight();

            const targetElement = messageRefs.current[state.focusPesanBalas];

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            // highlight sebentar
            targetElement.classList.add("bg-yellow-100");

            previousHighlightedRef.current = targetElement;

            // setTimeout(() => {
            //     removeHighlight();
            // }, 3000);
        }
    }, [state.focusPesanBalas]);

    const handleEllipsisClose = () => {
        dispatch({
            type: "SET_ELLIPSIS",
            payload: { ellipsisChat: "" },
        });
    };

    return (
        <div className="flex flex-col">
            {chatting.length > 0 ? (
                chatting.map((item) => {
                    const date = new Date(item.updated_at);
                    const hours = date.getHours().toString().padStart(2, "0");
                    const minutes = date
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                    const formattedTime = `${hours}:${minutes}`;

                    const now = new Date();

                    const diffMinutes = (now - date) / 1000 / 60;

                    const isOverMinutes = diffMinutes > 5;

                    const isOwn = item.sender_id === auth.user.id;

                    const repliedMessage = item.parent_id
                        ? chatting.find((c) => c.id === item.parent_id)
                        : null;

                    return isOwn ? (
                        // Pesan dari user yang sedang login (kanan)
                        <div
                            key={item.id}
                            ref={(el) => (messageRefs.current[item.id] = el)}
                            className="flex justify-end mb-5 items-center relative"
                        >
                            <div className="flex items-center gap-3 cursor-pointer group relative">
                                <div
                                    ref={(el) => {
                                        if (triggerRefs.current) {
                                            triggerRefs.current[item.id] = el;
                                        }
                                    }}
                                    onClick={() => handleEllipsisClick(item.id)}
                                    className="relative"
                                >
                                    <EllipsisIcon
                                        className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        size={16}
                                    />
                                    {state.ellipsisChat === item.id && (
                                        <OpsiEllipsis
                                            ellipsisClose={handleEllipsisClose}
                                            triggerRef={{
                                                current:
                                                    triggerRefs.current[
                                                        item.id
                                                    ],
                                            }}
                                            messageId={item.id}
                                            isOwn={true}
                                            auth={auth}
                                            itemChatUser={item}
                                            edit_pesan={edit_pesan}
                                            limit={isOverMinutes}
                                            balas_pesan={balas_pesan}
                                        />
                                    )}
                                </div>
                                <div className="bg-white p-3 rounded-l-2xl rounded-tr-2xl max-w-sm min-w-32 shadow-md">
                                    {repliedMessage && (
                                        <div
                                            onClick={() =>
                                                dispatch({
                                                    type: "PESAN_BALAS",
                                                    payload: repliedMessage.id,
                                                })
                                            }
                                            className="bg-gray-100 p-2 rounded mb-2"
                                        >
                                            <p className="text-sm text-gray-700">
                                                {repliedMessage.name ===
                                                auth.user.name
                                                    ? "Anda"
                                                    : repliedMessage.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {repliedMessage.pesan}
                                            </p>
                                        </div>
                                    )}

                                    {/* --- 2. TAMBAHKAN BLOK INI --- */}
                                    {/* Render file jika ada */}
                                    {item.file && item.file.length > 0 && (
                                        <div className="my-2 flex flex-col gap-2">
                                            {item.file.map((file, index) => (
                                                <FileRenderer
                                                    key={index}
                                                    fileUrl={file.file}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Tampilkan pesan teks HANYA jika ada */}
                                    {item.pesan && (
                                        <p className="text-sm leading-relaxed">
                                            {item.pesan}
                                        </p>
                                    )}
                                    {/* --- BATAS PERUBAHAN --- */}

                                    <div className="flex justify-end mt-1">
                                        <p className="text-xs opacity-80">
                                            {formattedTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Pesan dari user lain (kiri)
                        <div
                            key={item.id}
                            ref={(el) => (messageRefs.current[item.id] = el)}
                            className="flex justify-start items-center gap-3 mb-4 group cursor-pointer"
                        >
                            <div className="flex flex-row gap-3 justify-start">
                                {/* Avatar */}
                                <div className="p-3 rounded-full bg-blue-700 h-10 w-10 text-white flex justify-center items-center shadow-md flex-shrink-0">
                                    <p className="text-sm font-medium">
                                        {item.name.charAt(0).toUpperCase()}
                                    </p>
                                </div>

                                {/* Bubble pesan */}
                                <div className="p-2 bg-white min-w-40 max-w-sm rounded-bl-2xl rounded-r-2xl shadow-md border border-gray-100">
                                    <h1 className="text-blue-700 text-sm font-semibold mb-1">
                                        {item.name}
                                    </h1>
                                    {repliedMessage && (
                                        <div
                                            onClick={() =>
                                                dispatch({
                                                    type: "PESAN_BALAS",
                                                    payload: repliedMessage.id,
                                                })
                                            }
                                            className="bg-gray-100 p-2 rounded"
                                        >
                                            <p className="text-sm text-gray-700">
                                                {repliedMessage.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {repliedMessage.pesan}
                                            </p>
                                        </div>
                                    )}
                                    {/* Nama pengirim */}
                                    <div className="mt-2">
                                        {/* --- 2. TAMBAHKAN BLOK INI (LAGI) --- */}
                                        {/* Render file jika ada */}
                                        {item.file && item.file.length > 0 && (
                                            <div className="mb-2 flex flex-col gap-2">
                                                {item.file.map(
                                                    (file, index) => (
                                                        <FileRenderer
                                                            key={index}
                                                            fileUrl={file.file}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Tampilkan pesan teks HANYA jika ada */}
                                        {item.pesan && (
                                            <p className="text-sm leading-relaxed text-gray-800">
                                                {item.pesan}
                                            </p>
                                        )}
                                        {/* --- BATAS PERUBAHAN --- */}

                                        <div className="flex justify-end mt-1">
                                            <p className="text-xs text-gray-500">
                                                {formattedTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                ref={(el) => {
                                    if (triggerRefs.current) {
                                        triggerRefs.current[item.id] = el;
                                    }
                                }}
                                onClick={() => handleEllipsisClick(item.id)}
                                className="relative"
                            >
                                <EllipsisIcon
                                    className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    size={16}
                                />
                                {state.ellipsisChat === item.id && (
                                    <OpsiEllipsis
                                        ellipsisClose={handleEllipsisClose}
                                        triggerRef={{
                                            current:
                                                triggerRefs.current[item.id],
                                        }}
                                        messageId={item.id}
                                        isOwn={false}
                                        auth={auth}
                                        itemChatUser={item}
                                        edit_pesan={edit_pesan}
                                        balas_pesan={balas_pesan}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                // Empty state ketika tidak ada pesan
                <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <p className="text-lg">Belum ada pesan</p>
                        <p className="text-sm mt-1">
                            Mulai percakapan dengan mengirim pesan
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- 3. TAMBAHKAN KOMPONEN HELPER INI DI BAWAH ---
const FileRenderer = ({ fileUrl }) => {
    // Ambil ekstensi file dan bersihkan dari query parameter
    const extension = fileUrl.split(".").pop().toLowerCase().split("?")[0];
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);

    // Ambil nama file dari URL
    const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1).split("?")[0];

    if (isImage) {
        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <img
                    src={fileUrl}
                    alt="Lampiran gambar"
                    className="max-w-xs rounded-lg object-cover cursor-pointer border border-gray-200"
                />
            </a>
        );
    }

    // Jika bukan gambar, tampilkan sebagai link file biasa
    return (
        <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-3 rounded-lg bg-gray-100 p-3 text-sm text-gray-800 hover:bg-gray-200 max-w-xs border border-gray-200"
        >
            <Paperclip size={18} className="flex-shrink-0 text-gray-600" />
            <span className="truncate" title={fileName}>{fileName}</span>
        </a>
    );
};