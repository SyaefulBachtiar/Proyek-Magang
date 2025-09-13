import { router, usePage } from "@inertiajs/react";
import { EllipsisIcon, Reply, Trash2 } from "lucide-react";
import { useEffect, useReducer, useRef } from "react";

const initialState = {
    ellipsisChat: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_ELLIPSIS":
            return { ...state, ellipsisChat: action.payload.ellipsisChat };
        default:
            return state;
    }
}

const OpsiEllipsis = ({ ellipsisClose, triggerRef, messageId, isOwn, auth }) => {
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
                <li 
                onClick={() => router.delete(route('delete.pesan', {id: auth.user.id, id_pesan: messageId}))}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                </li>
                <li className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                    <Reply size={14} />
                    <span>Balas</span>
                </li>
            </ul>
        </div>
    );
};

export default function BubleChat({ chatting }) {
    const { auth } = usePage().props;
    const [state, dispatch] = useReducer(reducer, initialState);
    const triggerRefs = useRef({});

    const handleEllipsisClick = (messageId) => {
        dispatch({
            type: "SET_ELLIPSIS",
            payload: {
                ellipsisChat: state.ellipsisChat === messageId ? "" : messageId,
            },
        });
    };

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

                    const isOwn = item.sender_id === auth.user.id;

                    return isOwn ? (
                        // Pesan dari user yang sedang login (kanan)
                        <div
                            key={item.id}
                            className="flex justify-end mb-2 items-center relative"
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
                                        />
                                    )}
                                </div>
                                <div className="bg-white p-3 rounded-l-2xl rounded-tr-2xl max-w-sm min-w-32 shadow-md">
                                    <p className="text-sm leading-relaxed">
                                        {item.pesan}
                                    </p>
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
                            className="flex justify-start items-center gap-3 w-fit mb-4 group cursor-pointer"
                        >
                            <div className="flex flex-row gap-3 justify-start">
                                {/* Avatar */}
                                <div className="p-3 rounded-full bg-blue-700 h-10 w-10 text-white flex justify-center items-center shadow-md flex-shrink-0">
                                    <p className="text-sm font-medium">
                                        {item.name.charAt(0).toUpperCase()}
                                    </p>
                                </div>

                                {/* Bubble pesan */}
                                <div className="p-3 bg-white min-w-32 max-w-sm rounded-bl-2xl rounded-r-2xl shadow-md border border-gray-100">
                                    {/* Nama pengirim */}
                                    <div>
                                        <h1 className="text-blue-700 text-sm font-semibold mb-1">
                                            {item.name}
                                        </h1>
                                        <p className="text-sm leading-relaxed text-gray-800">
                                            {item.pesan}
                                        </p>
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
