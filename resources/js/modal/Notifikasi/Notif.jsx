import { router, usePage } from "@inertiajs/react";
import { Bell, BellOff, MessageCircleIcon, X } from "lucide-react";

export default function Notif ({close, notifData}) {
    const {auth} = usePage().props;
    // Fungsi helper untuk memformat waktu
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);

        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) {
            return "Baru saja";
        } else if (minutes < 60) {
            return `${minutes} menit yang lalu`;
        } else if (hours < 24) {
            return `${hours} jam yang lalu`;
        } else if (days === 1) {
            return "Kemarin";
        } else {
            // Untuk tanggal yang lebih lama, tampilkan format tanggal lokal
            return date.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    };

    return (
        <div className="fixed w-[300px] max-h-[400px] bg-white rounded-lg p-2 shadow-[0_2px_8px_rgba(0,0,0,0.10)] z-50 top-[70px] right-[300px]">
            <X
                onClick={close}
                size={25}
                className="cursor-pointer hover:bg-gray-200 rounded-md p-1"
            />
            <h1 className="font-semibold text-center text-xl">Notifikasi</h1>
            <div className="p-2 overflow-y-auto max-h-[300px] my-scrollable-element rounded-md flex flex-col gap-1 mt-5">
                {notifData.items.length > 0 ? (
                    notifData.items.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-md flex gap-2 items-start ${
                                !item.is_read ? "font-bold" : ""
                            }`}
                        >
                            <Bell size={20} className="text-gray-800 flex-shrink-0" />
                            <div className="flex flex-col">
                                <h1 className="font-semibold text-gray-800">
                                    {item.title}
                                </h1>
                                <p className="text-xs mt-[1px] font-semibold text-gray-600">
                                    {formatTimeAgo(item.created_at)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {item.message}
                                </p>
                                <div className="mt-1 flex gap-2">
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route("delete.notif", {
                                                    id: auth.user.id,
                                                    notif_id: item.id,
                                                })
                                            )
                                        }
                                        className="text-sm hover:bg-red-200 p-1 rounded-md"
                                    >
                                        Hapus
                                    </button>
                                    <button
                                        onClick={() =>
                                            router.post(
                                                route("mark.read.notif", {
                                                    id: auth.user.id,
                                                    notif_id: item.id,
                                                })
                                            )
                                        }
                                        className="text-sm hover:bg-blue-200 p-1 rounded-md"
                                    >
                                        Tandai sudah di baca
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full flex flex-col justify-center items-center gap-4 text-gray-500">
                        <BellOff size={40}/>
                        <p>Tidak ada Notifikasi</p>
                    </div>
                )}
                {/* <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-md flex gap-2 items-start">
                    <MessageCircleIcon size={20} className="text-gray-800" />
                    <div className="flex flex-col w-full">
                        <h1 className="font-semibold text-gray-800">Pesan</h1>
                        <p className="text-xs mt-[1px] font-semibold text-gray-600">
                            24/01/2025
                        </p>
                        <div className="w-full">
                            <p className="text-xs text-gray-600">
                                Pesan dari tim hore
                            </p>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button className="hover:bg-blue-300 p-1 rounded-md">
                                Balas
                            </button>
                            <button className="hover:bg-red-200 p-1 rounded-md">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}