import { useState } from 'react';
import Proyek from "../Proyek";

// Import semua component dari folder pageProyek
import ChatGrup from './ChatGrup';
import Kanban from './Kanban';
import Laporan from './Laporan';

export default function Ringkas({ dashboardId, activePage, tim }) {
    // State untuk track halaman aktif
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Handle navigation function
    const handleNavigation = (page) => {
        console.log(`Navigating to: ${page}`); // Debug log
        setCurrentPage(page);
    };

    // Jika currentPage bukan dashboard, render component yang sesuai
    if (currentPage === 'chat') {
        return <ChatGrup dashboardId={dashboardId} activePage="chat" tim={tim} onNavigate={handleNavigation} />;
    }

    if (currentPage === 'kanban') {
        return <Kanban dashboardId={dashboardId} activePage="kanban" tim={tim} onNavigate={handleNavigation} />;
    }

    if (currentPage === 'laporan') {
        return <Laporan dashboardId={dashboardId} activePage="laporan" tim={tim} onNavigate={handleNavigation} />;
    }

    if (currentPage === 'pengumuman') {
        return (
            <Proyek dashboardId={dashboardId} activePage="pengumuman" tim={tim}>
                <div className="p-8 bg-slate-100 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-800">📢 Pengumuman</h1>
                                <button 
                                    onClick={() => setCurrentPage('dashboard')}
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
    }

    if (currentPage === 'jadwal') {
        return (
            <Proyek dashboardId={dashboardId} activePage="jadwal" tim={tim}>
                <div className="p-8 bg-slate-100 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-800">📅 Jadwal</h1>
                                <button 
                                    onClick={() => setCurrentPage('dashboard')}
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
    }

    if (currentPage === 'dokumen') {
        return (
            <Proyek dashboardId={dashboardId} activePage="dokumen" tim={tim}>
                <div className="p-8 bg-slate-100 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-800">📁 Dokumen & File</h1>
                                <button 
                                    onClick={() => setCurrentPage('dashboard')}
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
    }

    // Default: tampilkan dashboard/ringkas
    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <div className="rounded-lg h-full bg-slate-300 flex justify-center items-center">
                <div className="flex w-[800px] h-[400px] gap-5 flex-wrap">
                    {/* Chat Grup - Link ke ChatGrup.jsx */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleNavigation('chat')}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">💬</div>
                            <div className="font-semibold text-gray-800">Chat Grup</div>
                        </div>
                    </div>

                    {/* Tugas - Link ke Kanban.jsx */}
                    <div 
                        className="w-64 h-48 flex-1 bg-white rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleNavigation('kanban')}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">📝</div>
                            <div className="font-semibold text-gray-800">Tugas</div>
                        </div>
                    </div>

                    {/* Laporan - Link ke Laporan.jsx */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleNavigation('laporan')}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="font-semibold text-gray-800">Laporan</div>
                        </div>
                    </div>

                    {/* Pengumuman */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleNavigation('pengumuman')}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">📢</div>
                            <div className="font-semibold text-gray-800">Pengumuman</div>
                        </div>
                    </div>

                    {/* Jadwal */}
                    <div 
                        className="w-64 h-48 flex-1 bg-white rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleNavigation('jadwal')}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">📅</div>
                            <div className="font-semibold text-gray-800">Jadwal</div>
                        </div>
                    </div>

                    {/* Dokumen */}
                    <div 
                        className="w-64 h-48 flex-none bg-white rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleNavigation('dokumen')}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">📁</div>
                            <div className="font-semibold text-gray-800">Dokumen</div>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}