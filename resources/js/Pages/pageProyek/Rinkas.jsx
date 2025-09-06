import Proyek from "../Proyek"
import { useState, useEffect } from "react"

export default function Ringkas({ dashboardId, activePage, tim }) {
    const [clickCount, setClickCount] = useState({});
    const [konamiSequence, setKonamiSequence] = useState([]);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [easterEggType, setEasterEggType] = useState('');

    // Konami Code: ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a
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
        setClickCount(prev => ({
            ...prev,
            [menuNumber]: (prev[menuNumber] || 0) + 1
        }));

        // Easter egg ketika Jadwal (Menu 3) diklik 7 kali
        if (menuNumber === 3 && (clickCount[3] || 0) + 1 === 7) {
            setEasterEggType('schedule');
            setShowEasterEgg(true);
            setTimeout(() => setShowEasterEgg(false), 4000);
        }

        // Easter egg ketika semua menu diklik minimal sekali
        const newClickCount = { ...clickCount, [menuNumber]: (clickCount[menuNumber] || 0) + 1 };
        const allClicked = [1, 2, 3, 4, 5, 6].every(num => newClickCount[num] > 0);
        if (allClicked && !showEasterEgg) {
            setEasterEggType('explorer');
            setShowEasterEgg(true);
            setTimeout(() => setShowEasterEgg(false), 3000);
        }
    };

    const getEasterEggMessage = () => {
        switch (easterEggType) {
            case 'konami':
                return "🎮 Konami Code activated! +30 lives untuk debugging! 🐛✨";
            case 'schedule':
                return "📅 Fun fact: Kamu udah klik jadwal 7x! Semoga jadwal proyek lancar ya! 🚀";
            case 'explorer':
                return "🏆 Achievement Unlocked: Menu Explorer! Kamu udah eksplorasi semua fitur! 👨‍💻";
            default:
                return "";
        }
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <div className="rounded-lg h-full bg-slate-300 flex justify-center items-center relative">
                {/* Easter Egg Notification */}
                {showEasterEgg && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-lg z-10 animate-bounce">
                        {getEasterEggMessage()}
                    </div>
                )}

                <div className="flex w-[800px] h-[400px] gap-5 flex-wrap">
                    {/* Chat Group */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleMenuClick(1)}
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-3 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6H9V4L3 7V9H21ZM21 10H3V13H21V10ZM21 14H3V24H5V16H7V24H9V16H11V24H13V16H15V24H17V16H19V24H21V14Z"/>
                            </svg>
                        </div>
                        <span className="font-medium text-gray-700">Chat Group</span>
                    </div>

                    {/* Pengumuman */}
                    <div 
                        className="w-64 h-48 flex-1 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleMenuClick(2)}
                    >
                        <div className="w-16 h-16 bg-orange-500 rounded-xl mb-3 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z"/>
                            </svg>
                        </div>
                        <span className="font-medium text-gray-700">Pengumuman</span>
                    </div>

                    {/* Jadwal */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleMenuClick(3)}
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-xl mb-3 flex items-center justify-center relative">
                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                            </svg>
                            {/* Tanda X merah kecil seperti di gambar */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">×</span>
                            </div>
                        </div>
                        <span className="font-medium text-gray-700">Jadwal</span>
                        {clickCount[3] > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                                Clicks: {clickCount[3]}/7
                            </div>
                        )}
                    </div>

                    {/* Tugas */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleMenuClick(4)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-700">Tugas</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                                    <span className="text-gray-600">Proyek klien PT Mentari - Contoh</span>
                                </div>
                                <span className="text-blue-500 underline">Selesai</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-gray-600">Handle WA Klien Week 4 Mei 25 - Contoh</span>
                                </div>
                                <span className="text-blue-500 underline">Selesai</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                                    <span className="text-gray-600">Handle WA Klien Week 1 Juni 25 - Contoh</span>
                                </div>
                                <span className="text-blue-500 underline">Dikerjakan</span>
                            </div>
                            <div className="flex items-center text-xs">
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                <span className="text-gray-600">Buat 3 konten Tiktok Juni 25 - Contoh</span>
                            </div>
                        </div>
                    </div>

                    {/* Pertanyaan */}
                    <div 
                        className="w-64 h-48 flex-1 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleMenuClick(5)}
                    >
                        <div className="w-16 h-16 bg-yellow-100 rounded-xl mb-3 flex items-center justify-center">
                            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5,2V13H8V22L15,13H11V2M13,2V4H15V2M17,2V4H19V2M19,5V7H21V5M19,8V10H21V8M19,11V13H21V11"/>
                            </svg>
                        </div>
                        <span className="font-medium text-gray-700">Pertanyaan</span>
                    </div>

                    {/* Dokumen & File */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleMenuClick(6)}
                    >
                        <div className="w-16 h-16 bg-blue-500 rounded-xl mb-3 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4Z"/>
                            </svg>
                        </div>
                        <span className="font-medium text-gray-700">Dokumen & File</span>
                    </div>
                </div>

                {/* Hidden hint for developers */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-30">
                    {/* Try the Konami Code! ↑↑↓↓←→←→BA */}
                </div>
            </div>
        </Proyek>
    );
}