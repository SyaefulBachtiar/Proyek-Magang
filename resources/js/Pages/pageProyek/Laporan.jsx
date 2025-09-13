import { Head, router } from "@inertiajs/react";
import Proyek from "../Proyek";
import { useState, useMemo, useEffect } from "react";

// Impor dari Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AlertTriangle, Calendar, CheckCircle2, ClipboardList, Coffee, ListTodo } from "lucide-react";

// Daftarkan komponen Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Kumpulan Ikon SVG ---
const SearchIcon = () => (
  <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>
    <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.134-.662 1.456 0l1.683 3.463 3.824 .556c.73.107 1.022.998.494 1.506l-2.768 2.698.654 3.808c.126.73-.638 1.283-1.29.952L10 13.6l-3.415 1.795c-.652.331-1.416-.222-1.29-.952l.654-3.808-2.768-2.698c-.528-.508-.236-1.399.494-1.506l3.824-.556L9.132 2.884z" clipRule="evenodd" />
  </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

// --- Komponen Kartu untuk Membangun Dashboard ---
const KinerjaCard = ({ user }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between h-full">
        <div>
            <h3 className="font-bold text-gray-800 mb-4">Laporan Kinerja Realtime:</h3>
            <div className="flex items-center gap-4">
                <img src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=c7d2fe&color=3730a3&size=48`} alt={user.name} className="w-12 h-12 rounded-full"/>
                <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full font-semibold">{user.role}</span>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">Tim : <span className="font-semibold text-gray-700">{user.team}</span></p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
            <div className="border border-gray-200 rounded-lg p-2 text-center">
                <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">Bagus</span>
                <div className="flex justify-center mt-1.5">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < 4} />)}
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-500 text-right">Periode :</p>
                <p className="font-semibold text-gray-800">1 Sep - 12 Sep</p>
            </div>
        </div>
    </div>
);
// Update RingkasanCard component untuk menggunakan data real
const RingkasanCard = ({ user, tugasPerTabs }) => {
    // Hitung data berdasarkan tugasPerTabs yang difilter untuk user yang dipilih
    const calculateProgressData = () => {
        if (!user || !tugasPerTabs) {
            return [
                { name: "Belum", value: 0, color: "#6B7280", percentage: 0 },
                { name: "Dikerjakan", value: 0, color: "#3B82F6", percentage: 0 },
                { name: "Terlambat", value: 0, color: "#EF4444", percentage: 0 },
                { name: "Selesai", value: 0, color: "#10B981", percentage: 0 },
                // { name: "Selesai Terlambat", value: 0, color: "#F59E0B", percentage: 0 }
            ];
        }

        // Hitung jumlah tugas per kategori untuk user yang dipilih
        const counts = {
            start: 0,
            progress: 0,
            terlambat: 0,
            selesai: 0,
            selesai_terlambat: 0
        };

        tugasPerTabs.forEach(tab => {
            tab.cards.forEach(task => {
                // Filter tugas yang melibatkan user yang dipilih
                const isUserInvolved = task.anggota_card_list.some(
                    anggota => anggota.user.id === user.id
                );
                
                if (isUserInvolved) {
                    if (tab.id === 'start') counts.start++;
                    else if (tab.id === 'progress') counts.progress++;
                    else if (tab.id === 'terlambat') counts.terlambat++;
                    else if (tab.id === 'selesai') counts.selesai++;
                    else if (tab.id === 'selesai_terlambat') counts.selesai_terlambat++;
                }
            });
        });

        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

        return [
            { 
                name: "Belum", 
                value: counts.start, 
                color: "#6B7280", 
                percentage: total > 0 ? Math.round((counts.start / total) * 100) : 0 
            },
            { 
                name: "Dikerjakan", 
                value: counts.progress, 
                color: "#3B82F6", 
                percentage: total > 0 ? Math.round((counts.progress / total) * 100) : 0 
            },
            { 
                name: "Terlambat", 
                value: counts.terlambat, 
                color: "#EF4444", 
                percentage: total > 0 ? Math.round((counts.terlambat / total) * 100) : 0 
            },
            { 
                name: "Selesai", 
                value: counts.selesai, 
                color: "#10B981", 
                percentage: total > 0 ? Math.round((counts.selesai / total) * 100) : 0 
            },
            // { 
            //     name: "Selesai Terlambat", 
            //     value: counts.selesai_terlambat, 
            //     color: "#F59E0B", 
            //     percentage: total > 0 ? Math.round((counts.selesai_terlambat / total) * 100) : 0 
            // }
        ].filter(item => item.value > 0); // Hanya tampilkan kategori yang memiliki data
    };

    const progressData = calculateProgressData();

    const chartData = {
        labels: progressData.map(item => item.name),
        datasets: [{
            data: progressData.map(item => item.value),
            backgroundColor: progressData.map(item => item.color),
            borderColor: '#ffffff', 
            borderWidth: 4,
        }],
    };

    const chartOptions = {
        responsive: true, 
        maintainAspectRatio: false, 
        cutout: '50%', 
        plugins: {
            legend: { display: false },
            tooltip: { 
                enabled: true, 
                backgroundColor: '#000', 
                cornerRadius: 6, 
                displayColors: true, 
                boxPadding: 4, 
                callbacks: { 
                    label: (c) => `${c.label}: ${c.raw} tugas` 
                }
            },
        },
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm h-full">
            <h3 className="font-bold text-gray-800 mb-2">Ringkasan Tugas Realtime</h3>
            <div className="flex items-center h-full -mt-2">
                {progressData.length > 0 ? (
                    <>
                        <div className="w-32 h-32 flex-shrink-0">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                        <div className="ml-4 flex flex-col gap-1.5">
                            {progressData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2 text-xs">
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full" 
                                        style={{ backgroundColor: item.color }} 
                                    />
                                    <span className="text-gray-600 font-medium">
                                        {item.name}: {item.value} ({item.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="text-center text-gray-500">
                            <Coffee size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-600">Tidak Ada Tugas</p>
                            <p className="text-xs">User ini belum memiliki tugas.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
const SaranCard = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm h-full">
        <h3 className="font-bold text-gray-800 mb-2">Saran</h3>
        <p className="text-sm text-gray-600 leading-relaxed">Tinggal percepat lagi penyelesaian tugas-tugas yang sedang dikerjakan. Atau tambahkan lagi tugas dari yang belum dikerjakan.</p>
    </div>
);
const TugasCard = ({ tabs }) => {
    // Set tab aktif pertama yang memiliki tugas, jika tidak, default ke tab pertama
    const firstTabWithTasks =
        tabs.find((t) => t.cards.length > 0)?.id || tabs[0]?.id || "";
    const [activeTab, setActiveTab] = useState(firstTabWithTasks);

    // -- Sub-komponen untuk menampilkan setiap item tugas --
    const TaskItem = ({ task }) => {
        const hasChecklist = task.checklist_card_count > 0;
        const isCompleted =
            hasChecklist &&
            task.completed_checklist_count === task.checklist_card_count;

        // Fungsi untuk format tanggal
        const formatDate = (dateString) => {
            if (!dateString) return null;
            return new Date(dateString).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
            });
        };

        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md">
                <p className="font-semibold text-gray-800 leading-snug">
                    {task.nama_card}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    {hasChecklist ? (
                        <span
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                                isCompleted
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                        >
                            {isCompleted ? (
                                <CheckCircle2 size={14} />
                            ) : (
                                <ClipboardList size={14} />
                            )}
                            <span className="font-medium">
                                {task.completed_checklist_count}/
                                {task.checklist_card_count}
                            </span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <ListTodo size={14} />
                            <span>Tanpa Checklist</span>
                        </span>
                    )}
                    {(task.due_date || task.created_at) && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span className="font-medium">
                                {formatDate(task.due_date) ||
                                    `Dibuat ${formatDate(task.created_at)}`}
                            </span>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Data untuk tab yang sedang aktif
    const activeTabData = tabs.find((tb) => tb.id === activeTab);

    return (
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-full flex flex-col">
            {/* Header Tab */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 border-b my-scrollable-element">
                {/* KONDISI `tab.cards.length > 0` TELAH DIHAPUS DARI SINI
                  Sekarang semua tab akan selalu ditampilkan.
                */}
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 flex-shrink-0 flex items-center gap-2 ${
                            activeTab === tab.id
                                ? "bg-gray-800 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                        }`}
                    >
                        {tab.id === "selesai" && <CheckCircle2 size={14} />}
                        {tab.id === "terlambat" && <AlertTriangle size={14} />}
                        {tab.judul}
                        <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                activeTab === tab.id
                                    ? "bg-white/20"
                                    : "bg-gray-200"
                            }`}
                        >
                            {tab.cards.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Daftar Tugas */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1">
                {activeTabData?.cards?.length > 0 ? (
                    activeTabData.cards.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-sm p-8">
                        <Coffee size={32} className="mb-3 text-gray-400" />
                        <p className="font-semibold text-gray-600">
                            Tidak Ada Tugas
                        </p>
                        <p>Anda bisa beristirahat sejenak di kategori ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PenghambatCard = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm h-full">
        <h3 className="font-bold text-gray-800 mb-4">Kemungkinan Penghambat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:divide-x md:divide-gray-200">
            <div className="md:pr-4">
                <p className="font-bold text-lg text-gray-800">0 dari 1 tugas yg belum</p><p className="text-xs text-gray-500 mt-1">masih belum dikerjakan &gt;40 hari</p>
                <div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs font-semibold text-gray-700">Top 1 tugas terlama</p><p className="text-sm text-gray-500">Belum ada data</p></div>
            </div>
            <div className="md:pl-4"><p className="font-bold text-lg text-gray-800">0 dari 0 tugas yg dikerjakan</p><p className="text-xs text-gray-500 mt-1">masih belum selesai &gt;40 hari</p>
                <div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs font-semibold text-gray-700">Top 1 tugas terlama</p><p className="text-sm text-gray-500">Belum ada data</p></div>
            </div>
        </div>
    </div>
);

const MemberList = ({ members, selectedUser, onSelectUser }) => (
  <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-2">
    {members.map((member) => (
      <div key={member.id} onClick={() => onSelectUser(member)} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${ selectedUser?.id === member.id ? "bg-blue-100 text-blue-800 font-semibold shadow-sm" : "hover:bg-gray-100"}`}>
        <img src={`https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=32`} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
        <span className="text-sm truncate">{member.name}</span>
      </div>
    ))}
  </div>
);

// --- Komponen Utama ---
export default function Laporan({ dashboardId, activePage, tim, anggotaTim, tugasPerTabs, id_board }) {

    // realtime
    useEffect(() => {
        if(!id_board) return;

        const channel = window.Echo.private(`board.${id_board}`);
        channel.listen('.board.updated', (event) => {
            router.reload({
                only: ["tugasPerTabs", "anggotaTim", "tim"],
                preserveState: true,
                preserveScroll: true,
            });
        })
        return () => {
            window.Echo.leave(`board.${id_board}`);
        }
    }, [id_board]);
   
    const generateFullTeamData = (members) => {
        if (!members || members.length === 0) return [];
        return members.map(member => {
            const progressValues = [
                { name: "Belum", value: 1, color: "#6B7280" }, { name: "Dikerjakan", value: 0, color: "#3B82F6" },
                { name: "Terlambat", value: 0, color: "#EF4444" }, { name: "Selesai", value: 4, color: "#90EE90" },
            ];
            const total = progressValues.reduce((s, i) => s + i.value, 0);
            const assignee = { name: member.name, avatar: `https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=32` };
            return {
                ...member, team: tim.nama_tim,
                progress: progressValues.map(i => ({ ...i, percentage: total > 0 ? Math.round((i.value / total) * 100) : 0 })),
                tasks: {
                    Selesai: [
                        { id: 1, title: 'Handle WA Klien Week 1 Juni 25 - Contoh', date: '5 Sep', assignee },
                        { id: 2, title: 'Buat 3 konten Tiktok Juni 25 - Contoh', date: '10 Sep', assignee },
                        { id: 3, title: 'Proyek klien PT Mentari - Contoh', date: '6 Sep', assignee },
                    ], Terlambat: [], Dikerjakan: [], Belum: [],
                },
            };
        });
    };
    
    const teamData = useMemo(() => generateFullTeamData(anggotaTim), [anggotaTim, tim]);
    const [selectedUser, setSelectedUser] = useState(teamData[0] || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");

    const filteredTeamData = teamData.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTugasTabs = useMemo(() => {
        if (!selectedUser) {
            // ... (return array kosong)
        }

        // Proses setiap tab untuk memfilter kartunya
        return tugasPerTabs.map((tab) => ({
            // Menggunakan prop `tugasPerTab`
            ...tab,
            cards: tab.cards.filter((task) =>
                // Logika ini SEKARANG AKAN BERHASIL karena controller mengirim `anggota_card_list`
                task.anggota_card_list.some(
                    (anggota) => anggota.user.id === selectedUser.id
                )
            ),
        }));
    }, [selectedUser, tugasPerTabs]);

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-100 p-4 lg:p-6 gap-6">
                <aside className="w-full lg:max-w-xs bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 h-fit">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-2">
                                Laporan Tim
                            </h2>
                            <div className="relative">
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) =>
                                        setSelectedPeriod(e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Bulan Ini">
                                        Periode: Bulan Ini
                                    </option>
                                    <option value="Bulan Lalu">
                                        Periode: Bulan Lalu
                                    </option>
                                </select>
                                <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                                    ▼
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Pilih Anggota
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari anggota..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                        {filteredTeamData.length > 0 ? (
                            <MemberList
                                members={filteredTeamData}
                                selectedUser={selectedUser}
                                onSelectUser={setSelectedUser}
                            />
                        ) : (
                            <p className="text-sm text-gray-500 text-center p-4">
                                Anggota tidak ditemukan.
                            </p>
                        )}
                    </div>
                </aside>

                <main className="flex-1 flex flex-col gap-6">
                    {selectedUser ? (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <KinerjaCard user={selectedUser} />
                                <RingkasanCard
                                    user={selectedUser}
                                    tugasPerTabs={filteredTugasTabs}
                                />
                                <SaranCard />
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                                <div className="xl:col-span-3">
                                    <TugasCard
                                        tabs={filteredTugasTabs}
                                        user={selectedUser}
                                    />
                                </div>
                                <div className="xl:col-span-2">
                                    <PenghambatCard />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Silakan Pilih Anggota Tim
                                </h3>
                                <p className="text-gray-500 mt-1">
                                    Pilih anggota dari daftar di sebelah kiri
                                    untuk melihat laporan.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </Proyek>
    );
}