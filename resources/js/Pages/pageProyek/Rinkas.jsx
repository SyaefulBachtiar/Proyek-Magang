import Proyek from "../Proyek";
import { useState, useEffect } from "react";
import { Head, router } from '@inertiajs/react';

export default function Ringkas({ dashboardId, activePage, tim, tugas, jumlahTugas }) {
    const [clickCount, setClickCount] = useState({});
    const [konamiSequence, setKonamiSequence] = useState([]);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [easterEggType, setEasterEggType] = useState('');

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    useEffect(() => {
        const handleKeyPress = (e) => {
            setKonamiSequence(prev => {
                const newSeq = [...prev, e.code].slice(-10);
                if (JSON.stringify(newSeq) === JSON.stringify(konamiCode)) {
                    setEasterEggType('konami');
                    setShowEasterEgg(true);
                    setTimeout(() => setShowEasterEgg(false), 5000);
                    return [];
                }
                return newSeq;
            });
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleMenuClick = (menuNumber) => {
        setClickCount(prev => ({ ...prev, [menuNumber]: (prev[menuNumber] || 0) + 1 }));
        const newClickCount = { ...clickCount, [menuNumber]: (clickCount[menuNumber] || 0) + 1 };
        const allClicked = [1, 2, 4, 5].every(num => newClickCount[num] > 0);
        if (allClicked && !showEasterEgg) {
            setEasterEggType('explorer');
            setShowEasterEgg(true);
            setTimeout(() => setShowEasterEgg(false), 3000);
        }
    };

    const getEasterEggMessage = () => {
        switch (easterEggType) {
            case 'konami': return "🎮 Konami Code activated! +30 lives untuk debugging! 🐛✨";
            case 'explorer': return "🏆 Achievement Unlocked: Menu Explorer! Kamu udah eksplorasi semua fitur! 👨‍💻";
            default: return "";
        }
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head title="Ringkasan"/>
            <div className="rounded-lg h-full bg-gray-100 flex justify-center items-center relative p-5">
                {showEasterEgg && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
                        {getEasterEggMessage()}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                    
                    {/* Chat Grup */}
                    <div className="w-full h-72 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow" 
                        onClick={() => {
                            handleMenuClick(1);
                            router.get(route('proyek.chatgrup', { id: dashboardId, id_tim: tim.id }));
                        }}>
                        <div className="w-20 h-20 mb-2 flex items-center justify-center">
                            <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M73.5 19.833C73.5 15.3325 69.8325 11.667 65.332 11.667H22.668C18.1675 11.667 14.5 15.3325 14.5 19.833V47.833C14.5 52.3335 18.1675 56 22.668 56H30.0755L31.1664 61.215C32.3326 66.8653 37.6625 72.833 44 72.833C50.3375 72.833 55.6674 66.8653 56.8336 61.215L57.9245 56H65.332C69.8325 56 73.5 52.3335 73.5 47.833V19.833Z" fill="#FBBF24"/><path d="M44 42.167C48.8688 42.167 52.833 38.2028 52.833 33.334C52.833 28.4652 48.8688 24.501 44 24.501C39.1312 24.501 35.167 28.4652 35.167 33.334C35.167 38.2028 39.1312 42.167 44 42.167Z" fill="#FFFFFF"/><path d="M59.8327 56.0003C59.8327 51.5833 52.8327 49.5 43.9993 49.5C35.166 49.5 28.166 51.5833 28.166 56.0003V57.167H59.8327V56.0003Z" fill="#FFFFFF"/></svg>
                        </div>
                        <span className="font-medium text-gray-700">Chat Grup</span>
                    </div>

                    {/* Pengumuman */}
                    <div className="w-full h-72 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow" 
                        // --- PERUBAHAN DI SINI ---
                        onClick={() => {
                            handleMenuClick(2);
                            router.get(route('proyek.pengumuman', { id: dashboardId, id_tim: tim.id }));
                        }}>
                        {/* --- AKHIR PERUBAHAN --- */}
                        <div className="w-20 h-20 mb-2 flex items-center justify-center">
                            <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M77 44C77 62.1244 62.1244 77 44 77C25.8756 77 11 62.1244 11 44C11 25.8756 25.8756 11 44 11C62.1244 11 77 25.8756 77 44Z" fill="#F1F5F9"/><path d="M60.1673 46.1663H60.166L47.5 33.333V59.0003L60.1673 46.1663Z" fill="#EA580C"/><path d="M29 36.6663V51.3337H35.3333L47.5 61.3337V31.6663L35.3333 41.6663H29V36.6663Z" fill="#FB923C"/><path d="M29 36.6663V41.6663H28V36.6663H29Z" fill="#EA580C"/><path d="M47.5 31.6663V33.333L46.6667 32.5V31.6663H47.5Z" fill="#EA580C"/></svg>
                        </div>
                        <span className="font-medium text-gray-700">Pengumuman</span>
                    </div>

                    {/* KARTU TUGAS */}
                    <div className="w-full h-72 bg-white rounded-xl shadow-sm p-4 flex flex-col cursor-pointer" 
                        onClick={() => {
                            handleMenuClick(4);
                            if (tim.board && tim.board.length > 0) {
                                router.get(route('proyek', { id: dashboardId, id_tim: tim.id, id_board: tim.board[0].id }));
                            } else {
                                console.error("Error: Tim ini tidak memiliki board.");
                            }
                        }}>
                        <div className="flex justify-center items-center gap-2 mb-3 flex-shrink-0">
                           <span className="font-bold text-gray-800 text-xl">Tugas</span>
                           <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{jumlahTugas}</span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-2 flex-grow flex flex-col gap-2 overflow-y-auto">
                            {tugas && tugas.length > 0 ? (
                                tugas.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg p-2.5 shadow-sm flex-shrink-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">{item.nama_card}</p>
                                        <p className="text-xs text-gray-500 mt-1">Dibuat: {formatDate(item.created_at)}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-500">Belum ada tugas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pertanyaan */}
                    <div className="w-full h-72 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMenuClick(5)}>
                        <div className="w-20 h-20 mb-2 flex items-center justify-center">
                            <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M77 44C77 62.1244 62.1244 77 44 77C25.8756 77 11 62.1244 11 44C11 25.8756 25.8756 11 44 11C62.1244 11 77 25.8756 77 44Z" fill="#F1F5F9" /><path d="M64.3333 60.5H23.6667C22.1939 60.5 21 59.3061 21 57.8333C21 56.3605 22.1939 55.1667 23.6667 55.1667H64.3333C65.8061 55.1667 67 56.3605 67 57.8333C67 59.3061 65.8061 60.5 64.3333 60.5Z" fill="#FBBF24" /><path d="M51.3333 55.1667C51.3333 49.3824 48.2738 44.2503 44 41.25V31.1667C47.8596 31.1667 51.3333 27.2262 51.3333 22.8333C51.3333 18.4404 47.8596 14.5 44 14.5C40.1404 14.5 36.6667 18.4404 36.6667 22.8333C36.6667 27.2262 40.1404 31.1667 44 31.1667V41.25C39.7262 44.2503 36.6667 49.3824 36.6667 55.1667H51.3333Z" fill="#FCD34D" /><path d="M52.8333 25.1667L64.3333 36.6667L60.5 40.5L49 29L52.8333 25.1667Z" fill="#94A3B8" /></svg>
                        </div>
                        <span className="font-medium text-gray-700">Pertanyaan</span>
                    </div>
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-30">
                    {/* Try the Konami Code! ↑↑↓↓←→←→BA */}
                </div>
            </div>
        </Proyek>
    );
}