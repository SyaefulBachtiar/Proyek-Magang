import { useState, useEffect } from 'react';
import Proyek from "../Proyek";

// Import semua component dari folder pageProyek
import ChatGrup from './ChatGrup';
import Kanban from './Kanban';
import Laporan from './Laporan';

export default function Ringkas({ dashboardId, activePage, tim }) {
    // State untuk track halaman aktif - sync dengan props activePage
    const [currentPage, setCurrentPage] = useState(activePage || 'ringkas');

    // Sync currentPage dengan activePage prop jika berubah dari navbar
    useEffect(() => {
        if (activePage) {
            setCurrentPage(activePage);
        }
    }, [activePage]);

    // Handle navigation function
    const handleNavigation = (page) => {
        console.log(`Navigating to: ${page}`);
        setCurrentPage(page);
    };

    // Function untuk kembali ke dashboard
    const backToDashboard = () => {
        setCurrentPage('ringkas');
    };

    // Router function - render component berdasarkan currentPage
    const renderCurrentPage = () => {
        switch(currentPage) {
            case 'chat':
                return (
                    <ChatGrup 
                        dashboardId={dashboardId} 
                        activePage="chat" 
                        tim={tim} 
                        onBack={backToDashboard}
                    />
                );

            case 'tugas':
            case 'kanban':
                return (
                    <Kanban 
                        dashboardId={dashboardId} 
                        boardId={dashboardId}
                        activePage="Proyek" 
                        tim={tim} 
                        onBack={backToDashboard}
                    />
                );

            case 'laporan':
                return (
                    <Laporan 
                        dashboardId={dashboardId} 
                        activePage="laporan" 
                        tim={tim} 
                        onBack={backToDashboard}
                    />
                );

            case 'pengumuman':
                return (
                    <Proyek dashboardId={dashboardId} activePage="pengumuman" tim={tim}>
                        <div className="p-8 bg-slate-100 min-h-screen">
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h1 className="text-2xl font-bold text-gray-800">📢 Pengumuman</h1>
                                        <button 
                                            onClick={backToDashboard}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            ← Kembali ke Dashboard
                                        </button>
                                    </div>
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📢</div>
                                        <h2 className="text-xl font-semibold mb-2">Halaman Pengumuman</h2>
                                        <p className="text-gray-600">Fitur pengumuman akan segera hadir!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Proyek>
                );

            case 'jadwal':
                return (
                    <Proyek dashboardId={dashboardId} activePage="jadwal" tim={tim}>
                        <div className="p-8 bg-slate-100 min-h-screen">
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h1 className="text-2xl font-bold text-gray-800">📅 Jadwal</h1>
                                        <button 
                                            onClick={backToDashboard}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            ← Kembali ke Dashboard
                                        </button>
                                    </div>
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📅</div>
                                        <h2 className="text-xl font-semibold mb-2">Halaman Jadwal</h2>
                                        <p className="text-gray-600">Fitur jadwal akan segera hadir!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Proyek>
                );

            case 'dokumen':
                return (
                    <Proyek dashboardId={dashboardId} activePage="dokumen" tim={tim}>
                        <div className="p-8 bg-slate-100 min-h-screen">
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h1 className="text-2xl font-bold text-gray-800">📁 Dokumen & File</h1>
                                        <button 
                                            onClick={backToDashboard}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            ← Kembali ke Dashboard
                                        </button>
                                    </div>
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📁</div>
                                        <h2 className="text-xl font-semibold mb-2">Halaman Dokumen & File</h2>
                                        <p className="text-gray-600">Fitur dokumen akan segera hadir!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Proyek>
                );

            case 'ringkas':
            default:
                return renderDashboard();
        }
    };

    // Dashboard menu layout
    const renderDashboard = () => {
        const menuItems = [
            {
                id: 'chat',
                icon: '💬',
                title: 'Chat Grup',
                description: 'Komunikasi tim real-time'
            },
            {
                id: 'tugas',
                icon: '📝',
                title: 'Tugas',
                description: 'Manajemen tugas project'
            },
            {
                id: 'laporan',
                icon: '📊',
                title: 'Laporan',
                description: 'Progress dan analisis'
            },
            {
                id: 'pengumuman',
                icon: '📢',
                title: 'Pengumuman',
                description: 'Pengumuman tim',
                comingSoon: true
            },
            {
                id: 'jadwal',
                icon: '📅',
                title: 'Jadwal',
                description: 'Kalender kegiatan',
                comingSoon: true
            },
            {
                id: 'dokumen',
                icon: '📁',
                title: 'Dokumen',
                description: 'File dan dokumen',
                comingSoon: true
            }
        ];

        return (
            <Proyek dashboardId={dashboardId} activePage="ringkas" tim={tim}>
                <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">
                                Dashboard Proyek
                            </h1>
                            <p className="text-slate-600">
                                Kelola proyek Anda dengan mudah
                            </p>
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuItems.map((menu) => (
                                <div
                                    key={menu.id}
                                    onClick={() => !menu.comingSoon && handleNavigation(menu.id)}
                                    className={`
                                        bg-white rounded-xl p-6 shadow-md border border-gray-200
                                        transition-all duration-300 cursor-pointer
                                        ${!menu.comingSoon 
                                            ? 'hover:shadow-lg hover:scale-105 hover:-translate-y-1' 
                                            : 'opacity-60 cursor-not-allowed'
                                        }
                                        group
                                    `}
                                >
                                    <div className="text-center">
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            {menu.icon}
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                            {menu.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-4">
                                            {menu.description}
                                        </p>
                                        
                                        {menu.comingSoon && (
                                            <span className="inline-block text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                                Segera Hadir
                                            </span>
                                        )}
                                        
                                        {!menu.comingSoon && (
                                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="w-0 h-full bg-blue-500 rounded-full group-hover:w-full transition-all duration-700"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Proyek>
        );
    };

    // Render halaman yang sesuai
    return renderCurrentPage();
}