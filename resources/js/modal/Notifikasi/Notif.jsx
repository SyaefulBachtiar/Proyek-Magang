import { Bell, MessageCircleIcon, X } from "lucide-react";

export default function Notif ({close}) {
    return (
        <div className="fixed w-[300px] max-h-[400px] bg-white rounded-lg p-2 shadow-[0_2px_8px_rgba(0,0,0,0.10)] z-50 top-[80px] right-[300px]">
            <X
                onClick={close}
                size={25}
                className="cursor-pointer hover:bg-gray-200 rounded-md p-1"
            />
            <h1 className="font-semibold text-center text-xl">Notifikasi</h1>
            <div className="p-2 overflow-y-auto max-h-[300px] my-scrollable-element rounded-md flex flex-col gap-1 mt-5">
                <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-md flex gap-2 items-start">
                    <Bell size={20} className="text-gray-800" />
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-gray-800">
                            Undangan Tim
                        </h1>
                        <p className="text-xs mt-[1px] font-semibold text-gray-600">
                            24/01/2025
                        </p>
                        <p className="text-xs text-gray-600">
                            Anda Telah di undang ke dalam tim hore
                        </p>
                        <div className="mt-1">
                            <button className="text-sm hover:bg-red-200 p-1 rounded-md">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-md flex gap-2 items-start">
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
                </div>
            </div>
        </div>
    );
}