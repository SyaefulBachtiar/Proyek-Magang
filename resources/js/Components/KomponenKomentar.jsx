import { router, usePage } from "@inertiajs/react";
import { Reply, Edit, Trash2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function KomponenKomentar({ komentar, id_board, balasKomentar, editKomentar}) {
    const { auth } = usePage().props;

    useEffect(() => {
        if(id_board){
            const channel = window.Echo.private(`board.${id_board}`);

            channel.listen(".board.updated", (event) => {
                router.reload({
                    only: ['komentar'],
                    preserveState: true,
                    preserveScroll: true,
                });
            });

            return () => {
                window.Echo.leave(`board.${id_board}`);
            }
        }
    }, [komentar]);

    const formatRelativeTime = (isoDate) => {
        const date = new Date(isoDate);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return `${seconds} detik yang lalu`;
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        return `${days} hari yang lalu`;
    };

    const currentUserId = auth.user.id;

    const handleDeleteKomentar = (idKomentar) => {
        router.delete(route('delete.komentar', {id: auth.user.id, id_komentar: idKomentar}));
    };

    return (
        <div className="mt-6 space-y-4">
            {komentar.length > 0 ? (
                komentar.map((komen) => (
                    <div
                        key={komen.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                            {komen.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium text-gray-900">
                                    {komen.user_name}
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formatRelativeTime(komen.created_at)}
                                </span>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                {komen.mention && (
                                    <p className="text-sm font-medium text-blue-600 mb-1 cursor-pointer hover:text-blue-700">
                                        @{komen.mention}
                                    </p>
                                )}
                                <div className="prose">
                                    <ReactMarkdown remakPlugins={[remarkGfm]}>
                                        {komen.komentar}
                                    </ReactMarkdown>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => balasKomentar(komen)}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Reply size={12} />
                                        Balas
                                    </button>

                                    {/* Show edit/delete only for comment owner */}
                                    {currentUserId &&
                                        komen.user_id === currentUserId && (
                                            <>
                                                <button
                                                    onClick={() => editKomentar(komen)}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors"
                                                >
                                                    <Edit size={12} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={ () => handleDeleteKomentar(
                                                        komen.id
                                                    )}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                    Hapus
                                                </button>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                        Belum ada komentar
                    </p>
                </div>
            )}
        </div>
    );
}
