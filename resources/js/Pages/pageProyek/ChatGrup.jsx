import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Proyek from "../Proyek";

export default function ChatGrup({ dashboardId, activePage }) {
    const { messages, user } = usePage().props;
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        await fetch('/chat/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({ message }),
        });

        setMessage('');
        window.location.reload(); // sementara untuk refresh pesan, nanti bisa diganti pakai realtime
    };

    const [chatMessages, setChatMessages] = useState([]);


    useEffect(() => {
    setChatMessages([
        { id: 1, text: 'Halo semua!', user_id: 2 },
        { id: 2, text: 'Selamat datang di grup!', user_id: 1 },
        { id: 3, text: 'Apa kabar semua?', user_id: 2 },
        { id: 4, text: 'Baik, siap kerja bareng!', user_id: 1 }
    ]);
}, []);

    useEffect(() => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}, [chatMessages]);


    return (
        <Proyek dashboardId={dashboardId} activePage={activePage}>
            <div className="p-4 bg-slate-100 min-h-screen">
                <h1 className="text-2xl font-bold text-center mb-4">Halaman Chat Grup</h1>

                <div className="bg-white p-4 rounded shadow mb-4 max-h-[400px] overflow-y-scroll">
                    {chatMessages?.length > 0 && chatMessages.map((message) => (
                        <div key={message.id} className={`flex mb-2 ${message.user_id === 1 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm break-words ${
                                message.user_id === 1
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                            }`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                </div>


                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border rounded px-2 py-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tulis pesan..."
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-1 rounded"
                    >
                        Kirim
                    </button>
                </form>
            </div>
        </Proyek>
    );
}
