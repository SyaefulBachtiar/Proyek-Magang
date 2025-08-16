import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import Proyek from "../Proyek";

const ChatGrup = ({ dashboardId, activePage, tim }) => {
    const { messages: initialMessages, user } = usePage().props;
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState(initialMessages || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);
    const pollIntervalRef = useRef(null);
    
    // ✅ State untuk track apakah ini first load
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // ✅ Function untuk scroll ke bawah
    const scrollToBottom = (smooth = false) => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    // ✅ Auto scroll ke bawah saat pertama kali load
    useEffect(() => {
        if (isFirstLoad && chatMessages && chatMessages.length > 0) {
            // Slight delay untuk memastikan DOM sudah ter-render
            setTimeout(() => {
                scrollToBottom(false); // Tanpa animasi untuk first load
                setIsFirstLoad(false);
            }, 100);
        }
    }, [chatMessages, isFirstLoad]);

    // ✅ Auto scroll ke bawah saat ada pesan baru (dengan smooth animation)
    useEffect(() => {
        if (!isFirstLoad) {
            scrollToBottom(true); // Dengan smooth animation untuk pesan baru
        }
    }, [chatMessages.length]); // Trigger saat jumlah pesan berubah

    // Safety check untuk props
    if (!tim) {
        return (
            <Proyek dashboardId={dashboardId} activePage={activePage} tim={null}>
                <div className="p-4 bg-slate-100 min-h-screen">
                    <div className="text-center text-red-500">
                        Error: Data tim tidak ditemukan
                    </div>
                </div>
            </Proyek>
        );
    }

    // Polling pesan baru setiap 3 detik
    useEffect(() => {
        if (!tim?.id) return;
        
        const pollNewMessages = async () => {
            try {
                const lastMessageId = chatMessages.length > 0 
                    ? Math.max(...chatMessages.map(msg => msg?.id || 0))
                    : 0;

                const response = await fetch(`/chat/tim/${tim.id}/baru?last_id=${lastMessageId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content || '',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
                        setChatMessages(prev => [...prev, ...data.messages]);
                    }
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        };

        pollIntervalRef.current = setInterval(pollNewMessages, 3000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [tim?.id, chatMessages]);

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <div className="p-4 bg-slate-100 min-h-screen">
                <h1 className="text-2xl font-bold text-center mb-4">Chat Grup Tim</h1>

                {/* Container Chat */}
                <div className="bg-white rounded-lg shadow-md mb-4 flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <h2 className="font-semibold text-gray-700">
                            {tim?.nama ? `Chat Grup - ${tim.nama}` : 'Chat Grup Tim'} 
                            {tim?.members && ` (${tim.members.length} anggota)`}
                        </h2>
                    </div>

                    {/* Area Pesan */}
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 p-4 overflow-y-auto space-y-3"
                        id="chatContainer"
                        style={{
                            // ✅ Tambahan CSS untuk smooth scrolling
                            scrollBehavior: 'smooth'
                        }}
                    >
                        {chatMessages?.length > 0 ? (
                            chatMessages.map((msg, index) => {
                                // Safety check untuk setiap message
                                if (!msg || typeof msg !== 'object') {
                                    return null;
                                }
                                
                                const messageId = msg.id || `msg-${index}`;
                                const userId = msg.user_id;
                                const isOwn = userId === user?.id;
                                
                                return (
                                    <div 
                                        key={messageId} 
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : ''}`}>
                                            {/* Nama pengirim (hanya untuk pesan orang lain) */}
                                            {!isOwn && (
                                                <div className="text-xs text-gray-500 mb-1 px-1">
                                                    {msg.user_name || 'Anonymous'}
                                                </div>
                                            )}
                                            
                                            {/* Bubble Pesan */}
                                            <div className={`px-4 py-2 rounded-2xl text-sm break-words ${
                                                isOwn
                                                    ? 'bg-blue-500 text-white rounded-br-md'
                                                    : 'bg-gray-200 text-gray-800 rounded-bl-md'
                                            }`}>
                                                <div>{msg.text || msg.pesan || '[Pesan tidak dapat ditampilkan]'}</div>
                                                
                                                {/* Waktu */}
                                                <div className={`text-xs mt-1 ${
                                                    isOwn
                                                        ? 'text-blue-100' 
                                                        : 'text-gray-500'
                                                }`}>
                                                    {(() => {
                                                        try {
                                                            const date = new Date(msg.created_at);
                                                            return date.toLocaleTimeString('id-ID', { 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' 
                                                            });
                                                        } catch (error) {
                                                            return '--:--';
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Belum ada pesan. Mulai percakapan!
                            </div>
                        )}
                        
                        {/* ✅ Invisible element sebagai scroll anchor */}
                        <div id="chat-bottom" style={{ height: '1px' }}></div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form Input */}
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        
                        if (!message.trim()) {
                            return;
                        }

                        setIsLoading(true);
                        setError('');

                        try {
                            const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
                            
                            if (!csrfToken) {
                                throw new Error('CSRF token not found');
                            }

                            const response = await fetch('/chat/kirim', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': csrfToken,
                                },
                                body: JSON.stringify({ 
                                    pesan: message.trim(),
                                    tim_id: tim?.id 
                                }),
                            });

                            const data = await response.json();

                            if (data.success && data.message) {
                                setChatMessages(prev => [...prev, data.message]);
                                setMessage('');
                                // ✅ Scroll ke bawah setelah mengirim pesan
                                setTimeout(() => scrollToBottom(true), 50);
                            } else {
                                setError(data.message || 'Gagal mengirim pesan');
                            }
                        } catch (error) {
                            console.error('Error sending message:', error);
                            setError('Terjadi kesalahan saat mengirim pesan');
                        } finally {
                            setIsLoading(false);
                        }
                    }} className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tulis pesan..."
                                disabled={isLoading}
                                maxLength={1000}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !message.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-full transition-colors duration-200 font-medium"
                            >
                                {isLoading ? 'Kirim...' : 'Kirim'}
                            </button>
                        </div>
                        
                        {/* Character Counter */}
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            {message.length}/1000
                        </div>
                    </form>
                </div>

                {/* ✅ BONUS: Tombol scroll ke bawah jika user scroll ke atas */}
                <ScrollToBottomButton 
                    chatContainerRef={chatContainerRef} 
                    scrollToBottom={() => scrollToBottom(true)} 
                />

                {/* Info Tim */}
                {tim && tim.members && tim.members.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-2">Anggota Tim: {tim.nama}</h3>
                        <div className="flex flex-wrap gap-2">
                            {tim.members.map((member, index) => (
                                <span 
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {member.name}
                                    {member.id === user?.id && ' (Anda)'}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Proyek>
    );
};

// ✅ BONUS: Komponen tombol scroll ke bawah
const ScrollToBottomButton = ({ chatContainerRef, scrollToBottom }) => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (chatContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
                setShowButton(!isAtBottom);
            }
        };

        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [chatContainerRef]);

    if (!showButton) return null;

    return (
        <button
            onClick={scrollToBottom}
            className="fixed bottom-20 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
            title="Scroll ke bawah"
        >
            ↓
        </button>
    );
};

export default ChatGrup;