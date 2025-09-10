import { usePage } from "@inertiajs/react";

export default function BubleChat({ chatting }) {
    const { auth } = usePage().props;

    return (
        <div className="flex flex-col ">
            {chatting.length > 0 ? (
                chatting.map((item) => {
                    const date = new Date(item.updated_at);
                    const hours = date.getHours().toString().padStart(2, "0");
                    const minutes = date
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                    const formattedTime = `${hours}:${minutes}`;

                    return item.sender_id === auth.user.id ? (
                        // Pesan dari user yang sedang login (kanan)
                        <div key={item.id} className="flex justify-end mb-2">
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
                    ) : (
                        // Pesan dari user lain (kiri)
                        <div key={item.id} className="flex justify-start mb-4">
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
