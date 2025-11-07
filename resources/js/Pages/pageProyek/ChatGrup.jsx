// Cara install:
// npm install emoji-picker-react

import {
    EllipsisIcon,
    Loader2,
    Paperclip,
    SendHorizonal,
    Smile,
    X,
} from "lucide-react";
import Proyek from "../Proyek";
import { useEffect, useReducer, useRef, useState } from "react";
import BubleChat from "@/Components/BubleChat";
import { Head, router, usePage } from "@inertiajs/react";
import EmojiPicker from "emoji-picker-react";

const initialState = {
    pesanText: "",
    pesanFile: [],
    previewFile: [],
    loading: false,
    pesan_edit: "",
    id_balas: "",
    nama_balasan: "",
    pesan_balasan: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_PESAN_TEXT":
            return { ...state, pesanText: action.payload };
        case "SET_PESAN_FILE":
            return {
                ...state,
                pesanFile: [...state.pesanFile, action.payload.file],
                previewFile: [...state.previewFile, action.payload.preview],
            };
        case "EDIT_PESAN":
            return {...state, pesan_edit: action.payload };
        case "BALAS_PESAN":
            return {...state, id_balas: action.payload.id_balas, nama_balasan: action.payload.nama_balasan, pesan_balasan: action.payload.pesan_balasan}
        case "RESET_BALAS": 
            return {...state, id_balas: "", nama_balasan: "", pesan_balasan: ""}
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "REMOVE_FILE":
            URL.revokeObjectURL(state.previewFile[action.payload]);
            const newFiles = state.pesanFile.filter(
                (_, index) => index !== action.payload
            );
            const newPreviews = state.previewFile.filter(
                (_, index) => index !== action.payload
            );
            return {
                ...state,
                pesanFile: newFiles,
                previewFile: newPreviews,
            };
        case "RESET_STATE":
            if (state.previewFile) {
                URL.revokeObjectURL(state.previewFile);
            }
            return initialState;
        default:
            return state;
    }
}

export default function ChatGrup({
    dashboardId,
    activePage,
    tim,
    chating,
    id_board,
}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { auth } = usePage().props;

    // Refs
    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const previousMessageCount = useRef(chating?.length || 0);
    const emojiPickerRef = useRef(null);

    // Function untuk scroll ke bawah
    const scrollToBottom = (behavior = "smooth") => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: behavior,
            });
        }
    };

    // Handle emoji click
    const onEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji;
        const textarea = textareaRef.current;

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentText = state.pesanText;

            const newText =
                currentText.substring(0, start) +
                emoji +
                currentText.substring(end);

            dispatch({
                type: "SET_PESAN_TEXT",
                payload: newText,
            });
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                    start + emoji.length,
                    start + emoji.length
                );
            }, 0);
        }
        setShowEmojiPicker(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // broadcast untuk realtim
    useEffect(() => {
        if (!id_board) return;
        const channel = window.Echo.private(`board.${id_board}`);
        channel.listen(".board.updated", (event) => {
            router.reload({
                only: ["chating"],
                preserveState: true,
                preserveScroll: false,
            });
        });

        return () => {
            window.Echo.leave(`board.${id_board}`);
        };
    }, [id_board]);

    // Auto scroll ketika ada pesan baru
    useEffect(() => {
        const currentMessageCount = chating?.length || 0;
        if (currentMessageCount > previousMessageCount.current) {
            setTimeout(() => {
                scrollToBottom("smooth");
            }, 100);
        }
        previousMessageCount.current = currentMessageCount;
    }, [chating]);

    // focus ke inputan
    useEffect(() => {
        if (textareaRef.current && state.pesanText !== "") {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                state.pesanText.length,
                state.pesanText.length
            );
        }
    }, [state.pesanText]);

    // Scroll ke bawah saat pertama kali load
    useEffect(() => {
        setTimeout(() => {
            scrollToBottom("auto");
        }, 100);
    }, []);

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [state.pesanText]);

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files) {
            for (const file of files) {
                const previewUrl = URL.createObjectURL(file);
                dispatch({
                    type: "SET_PESAN_FILE",
                    payload: { file, preview: previewUrl },
                });
            }
        }
        e.target.value = null;
    };

    const handleSendMessage = () => {
        if (state.pesanText.trim() === "" && state.pesanFile.length === 0) {
            return;
        }

        dispatch({ type: "SET_LOADING", payload: true });

        const payload = {
            pesan_text: state.pesanText,
            pesan_file: state.pesanFile,
            ...(state.id_balas && {id_pesan_balas: state.id_balas})
        };

        if(state.pesan_edit){
            router.put(
                route("edit.pesan", {
                    id: auth.user.id,
                    id_pesan: state.pesan_edit,
                }),
                {
                    pesan_text: state.pesanText,
                },
                {
                    preserveState: true,
                    preserveScroll: false,
                    onSuccess: () => {
                        dispatch({ type: "RESET_STATE" });
                        setTimeout(() => {
                            scrollToBottom("smooth");
                        }, 200);
                    },
                    onFinish: () => {
                        dispatch({typ: "SET_LOADING", payload: false});
                    }
                }
            );
        }else{
            router.post(
                route("kirim.pesan", { id: auth.user.id, id_tim: tim?.id }),
                payload,
                {
                    preserveState: true,
                    preserveScroll: false,
                    onSuccess: () => {
                        dispatch({ type: "RESET_STATE" });
                        setTimeout(() => {
                            scrollToBottom("smooth");
                        }, 200);
                    },
                    onFinish: () => {
                        dispatch({ type: "SET_LOADING", payload: false });
                    },
                }
            );
        }
    };

    const handleClearFile = (index) => {
        dispatch({ type: "REMOVE_FILE", payload: index });
    };

    const isDisabled =
        state.pesanText.trim() === "" && state.pesanFile.length === 0;

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head title="Chat Grup" />
            <div className="w-full h-full flex flex-col relative">
                {/* Header */}
                <div className="bg-[#90B4DE] p-6 text-gray-100 flex justify-between">
                    <h1 className="text-xl">Chat Grup</h1>
                    <div className="cursor-pointer">
                        <EllipsisIcon />
                    </div>
                </div>

                {/* Chat konten */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 my-scrollable-element"
                    style={{ scrollBehavior: "smooth" }}
                >
                    <BubleChat
                        chatting={chating}
                        edit_pesan={(val, id) =>{
                            dispatch({ type: "SET_PESAN_TEXT", payload: val })
                            dispatch({ type: "EDIT_PESAN", payload: id });
                        }
                        }
                        balas_pesan={(idBalasan, nama, pesan) => {
                            dispatch({type: "BALAS_PESAN", payload: {id_balas: idBalasan, nama_balasan: nama, pesan_balasan: pesan}});
                            textareaRef.current?.focus();
                        }}
                    />
                </div>

                {/* Input chat */}
                <div className="w-full px-2 pb-4 pt-2 relative">
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div
                            ref={emojiPickerRef}
                            className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-lg overflow-hidden"
                        >
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme="light"
                                width={320}
                                height={400}
                                previewConfig={{
                                    showPreview: false,
                                }}
                                searchDisabled={false}
                                skinTonesDisabled={false}
                            />
                        </div>
                    )}

                    <div className="flex items-center relative">
                        <div className="w-full pt-2 bg-white rounded-xl flex items-center shadow-lg">
                            <div className="space-y-2 w-full">
                                {/* Preview file */}
                                {state.id_balas ? (
                                    <div className="px-2 bg-white">
                                        <div 
                                        onClick={() => dispatch({type: "RESET_BALAS" })}
                                        className="cursor-pointer">
                                            <X size={14} />
                                        </div>
                                        <div className="p-2 bg-gray-100 rounded">
                                            <p className="text-gray-800">{state.nama_balasan === auth.user.name ? "Anda" : state.nama_balasan}</p>
                                            <p className="text-gray-500 ml-2">{state.pesan_balasan}</p>
                                        </div>
                                    </div>
                                ) : null}
                                {state.previewFile.length > 0 && (
                                    <div className="p-2 mb-2 bg-gray-100 rounded-md flex flex-wrap gap-2">
                                        {state.previewFile.map(
                                            (previewUrl, index) => (
                                                <div
                                                    key={index}
                                                    className="w-[80px] h-[80px] relative rounded-md overflow-hidden"
                                                >
                                                    <img
                                                        src={previewUrl}
                                                        alt={`preview-${index}`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <div
                                                        onClick={() =>
                                                            handleClearFile(
                                                                index
                                                            )
                                                        }
                                                        className="absolute top-0 right-0 cursor-pointer bg-gray-300 rounded-full"
                                                    >
                                                        <X size={16} />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                <textarea
                                    ref={textareaRef}
                                    value={state.pesanText}
                                    onChange={(e) =>
                                        dispatch({
                                            type: "SET_PESAN_TEXT",
                                            payload: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl p-4 border-none pr-[160px] resize-none focus:outline-none focus:ring-0 focus:shadow-none overflow-y-scroll min-h-[50px] max-h-[120px] hide-scrollbar"
                                    placeholder="Tulis pesan..."
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!isDisabled && !state.loading) {
                                                handleSendMessage();
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="absolute h-full right-5 top-0 flex items-end pb-[14px]">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center gap-4">
                                        {/* Emoji Button */}
                                        <div
                                            className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
                                            onClick={() =>
                                                setShowEmojiPicker(
                                                    !showEmojiPicker
                                                )
                                            }
                                        >
                                            <Smile
                                                className={
                                                    showEmojiPicker
                                                        ? "text-blue-600"
                                                        : ""
                                                }
                                            />
                                        </div>

                                        {/* File Button */}
                                        <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                                            <label
                                                htmlFor="pesanFile"
                                                className="cursor-pointer"
                                            >
                                                <Paperclip />
                                            </label>
                                            <input
                                                type="file"
                                                id="pesanFile"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                multiple
                                            />
                                        </div>
                                    </div>

                                    {/* Send Button */}
                                    <button
                                        disabled={isDisabled}
                                        className={`p-3 rounded-full text-white transition-all ${
                                            isDisabled
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 cursor-pointer hover:bg-blue-700"
                                        }`}
                                        onClick={handleSendMessage}
                                    >
                                        {state.loading ? (
                                            <Loader2
                                                size={20}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <SendHorizonal size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}
