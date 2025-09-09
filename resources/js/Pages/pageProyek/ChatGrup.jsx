
import { EllipsisIcon, Paperclip, SendHorizonal, Smile } from "lucide-react";
import Proyek from "../Proyek";
import { useEffect, useRef, useState } from "react";

export default function ChatGrup ({ dashboardId, activePage, tim }) {
    // State untuk menyimpan nilai dari textarea
    const [message, setMessage] = useState("");
    // Ref untuk mengakses elemen DOM textarea secara langsung
    const textareaRef = useRef(null);

    // useEffect hook untuk menyesuaikan tinggi textarea setiap kali 'message' berubah
    useEffect(() => {
        if (textareaRef.current) {
            // Atur tinggi ke 'auto' terlebih dahulu agar scrollHeight dihitung dengan benar
            textareaRef.current.style.height = "auto";
            // Set tinggi elemen sesuai dengan scrollHeight-nya
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSendMessage = () => {
        // Logika untuk mengirim pesan
        console.log("Pesan terkirim:", message);
        // Kosongkan textarea setelah pesan dikirim
        setMessage("");
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <div className="w-full h-full flex flex-col relative">
                {/* Header */}
                <div className="bg-[#90B4DE] p-6 text-gray-100 flex justify-between">
                    <h1 className="text-xl">Chat Grup</h1>
                    <div className="cursor-pointer">
                        <EllipsisIcon />
                    </div>
                </div>
                {/* Chat konten */}
                <div className="flex-1 overflow-y-auto p-4 my-scrollable-element">
                    <div className="flex justify-end mb-4">
                        <div className="bg-blue-500 text-white p-3 rounded-l-lg rounded-tr-lg max-w-sm">
                            Halo, apa kabar semua? Semoga proyek kita berjalan
                            lancar.
                        </div>
                    </div>
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-200 p-3 rounded-r-lg rounded-tl-lg max-w-sm text-gray-800">
                            Kabar baik! Aku setuju, kita harus terus semangat.
                        </div>
                    </div>
                    <div className="flex justify-end mb-4">
                        <div className="bg-blue-500 text-white p-3 rounded-l-lg rounded-tr-lg max-w-sm">
                            Halo, apa kabar semua? Semoga proyek kita berjalan
                            lancar.
                        </div>
                    </div>
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-200 p-3 rounded-r-lg rounded-tl-lg max-w-sm text-gray-800">
                            Kabar baik! Aku setuju, kita harus terus semangat.
                        </div>
                    </div>
                    <div className="flex justify-end mb-4">
                        <div className="bg-blue-500 text-white p-3 rounded-l-lg rounded-tr-lg max-w-sm">
                            Halo, apa kabar semua? Semoga proyek kita berjalan
                            lancar.
                        </div>
                    </div>
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-200 p-3 rounded-r-lg rounded-tl-lg max-w-sm text-gray-800">
                            Kabar baik! Aku setuju, kita harus terus semangat.
                        </div>
                    </div>
                </div>

                {/* Input chat */}
                <div className="w-full px-2 pb-4 pt-2">
                    <div className="flex items-center relative">
                        <div className="w-full p-2 bg-white rounded-xl flex items-center shadow-lg">
                            <textarea
                                // Atribut ref untuk menghubungkan elemen DOM ke useRef
                                ref={textareaRef}
                                // State 'message' sebagai nilai textarea
                                value={message}
                                // Event handler untuk memperbarui state
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full rounded-xl p-4 border-none pr-[100px] resize-none focus:outline-none focus:ring-0 focus:shadow-none overflow-y-scroll min-h-[50px] max-h-[150px] hide-scrollbar"
                                placeholder="Tulis pesan..."
                                rows={1} // Menggunakan rows={1} agar height dihitung dari baris pertama
                            />
                            <div className="absolute h-full right-5 top-0 flex items-end pb-4">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="cursor-pointer">
                                            <Smile />
                                        </div>
                                        <div className="cursor-pointer">
                                            <Paperclip />
                                        </div>
                                    </div>
                                    <div
                                        className="p-3 bg-blue-600 rounded-full text-white cursor-pointer"
                                        onClick={handleSendMessage}
                                    >
                                        <SendHorizonal size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
};
