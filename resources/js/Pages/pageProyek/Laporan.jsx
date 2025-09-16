import { Head, router } from "@inertiajs/react";
import Proyek from "../Proyek";
import { useState, useMemo, useEffect } from "react";

// Impor dari Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Impor Ikon dari Lucide React untuk konsistensi visual
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Coffee,
    Lightbulb,
    ListTodo,
    Search,
    Star,
    UserX,
    Users
} from "lucide-react";

// Daftarkan komponen Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Komponen Ikon Kustom (Dibuat ulang dengan Lucide untuk konsistensi) ---
const StarIcon = ({ filled }) => (
  <Star className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill={filled ? 'currentColor' : 'none'} />
);

// --- Komponen Kartu untuk Membangun Dashboard (Tampilan disempurnakan) ---

const KinerjaCard = ({ user }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between h-full border border-gray-200/80">
        <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Laporan Kinerja</h3>
            <div className="flex items-center gap-4">
                <img src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=c7d2fe&color=3730a3&size=48`} alt={user.name} className="w-12 h-12 rounded-full"/>
                <div>
                    <p className="font-bold text-gray-800 text-lg">{user.name}</p>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{user.role}</span>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                <Users size={14} />
                Tim: <span className="font-semibold text-gray-700">{user.team}</span>
            </p>
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-center">
                <span className="text-xs bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">Bagus</span>
                <div className="flex justify-center mt-2 gap-0.5">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < 4} />)}
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500">Periode</p>
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
    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-sm h-full flex flex-col items-start border border-indigo-700">
        <div className="bg-white/20 p-2 rounded-lg mb-4">
          <Lightbulb size={24} className="text-white"/>
        </div>
        <h3 className="font-bold text-lg mb-2">Saran & Rekomendasi</h3>
        <p className="text-sm text-indigo-100 leading-relaxed">
            Percepat penyelesaian tugas yang sedang dikerjakan, atau mulai kerjakan tugas baru untuk menjaga produktivitas.
        </p>
    </div>
);

const TugasCard = ({ tabs }) => {
    const firstTabWithTasks = tabs.find((t) => t.cards.length > 0)?.id || tabs[0]?.id || "";
    const [activeTab, setActiveTab] = useState(firstTabWithTasks);

    const TaskItem = ({ task }) => {
        const hasChecklist = task.checklist_card_count > 0;
        const isCompleted = hasChecklist && task.completed_checklist_count === task.checklist_card_count;
        const formatDate = (dateString) => {
            if (!dateString) return null;
            return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        };
        return (
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col gap-3 transition-all hover:shadow-lg hover:border-blue-400 hover:-translate-y-1">
                <p className="font-semibold text-gray-800 leading-snug">{task.nama_card}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    {hasChecklist ? (
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                            {isCompleted ? <CheckCircle2 size={14} /> : <ClipboardList size={14} />}
                            <span>{task.completed_checklist_count}/{task.checklist_card_count}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-gray-400 px-2.5 py-1">
                            <ListTodo size={14} />
                            <span>Tanpa Checklist</span>
                        </span>
                    )}
                    {(task.due_date || task.created_at) && (
                        <span className="flex items-center gap-1.5 font-medium">
                            <Calendar size={14} />
                            <span>{formatDate(task.due_date) || `Dibuat ${formatDate(task.created_at)}`}</span>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const activeTabData = tabs.find((tb) => tb.id === activeTab);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm h-full flex flex-col border border-gray-200/80">
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-3 border-b border-gray-200 styled-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${
                            activeTab === tab.id
                                ? "bg-gray-800 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {tab.id === "selesai" && <CheckCircle2 size={16} />}
                        {tab.id === "terlambat" && <AlertTriangle size={16} />}
                        {tab.judul}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                            {tab.cards.length}
                        </span>
                    </button>
                ))}
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1 styled-scrollbar">
                {activeTabData?.cards?.length > 0 ? (
                    activeTabData.cards.map((task) => <TaskItem key={task.id} task={task} />)
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-sm p-8">
                        <Coffee size={36} className="mb-4 text-gray-400" />
                        <p className="font-semibold text-gray-700 text-base">Tidak Ada Tugas</p>
                        <p>Anda bisa beristirahat sejenak di kategori ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PenghambatCard = () => {
    const StatItem = ({ value, label, subLabel, taskName }) => (
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700">Tugas terlama</p>
                <p className="text-sm text-gray-500 mt-1 truncate">{taskName}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm h-full border border-gray-200/80">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Potensi Penghambat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatItem
                    value="0 dari 1"
                    label="Belum Dikerjakan"
                    subLabel="lebih dari 40 hari"
                    taskName="Belum ada data"
                />
                 <StatItem
                    value="0 dari 0"
                    label="Masih Dikerjakan"
                    subLabel="lebih dari 40 hari"
                    taskName="Belum ada data"
                />
            </div>
        </div>
    );
};

const MemberList = ({ members, selectedUser, onSelectUser }) => (
  <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-2 styled-scrollbar">
    {members.map((member) => (
      <div
        key={member.id}
        onClick={() => onSelectUser(member)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedUser?.id === member.id
            ? "bg-blue-600 text-white font-semibold shadow-md"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <img
            src={`https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=32`}
            alt={member.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
        />
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

    // --- LOGIKA FUNGSI DI BAWAH INI TIDAK DIUBAH SAMA SEKALI ---
    const generateFullTeamData = (members) => {
        if (!members || members.length === 0) return [];
        return members.map(member => {
            const progressValues = [
                { name: "Belum", value: 1, color: "#6B7280" }, { name: "Dikerjakan", value: 0, color: "#3B82F6" },
                { name: "Terlambat", value: 0, color: "#EF4444" }, { name: "Selesai", value: 4, color: "#22C55E" },
            ];
            const total = progressValues.reduce((s, i) => s + i.value, 0);
            return {
                ...member, team: tim.nama_tim, role: "Anggota Tim",
                progress: progressValues.map(i => ({ ...i, percentage: total > 0 ? Math.round((i.value / total) * 100) : 0 })),
            };
        });
    };

    const teamData = useMemo(() => generateFullTeamData(anggotaTim), [anggotaTim, tim]);
    const [selectedUser, setSelectedUser] = useState(teamData[0] || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");

    const filteredTeamData = useMemo(() =>
        teamData.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [teamData, searchTerm]
    );

    const filteredTugasTabs = useMemo(() => {
        if (!selectedUser) {
            return tugasPerTabs.map(tab => ({ ...tab, cards: [] }));
        }
        return tugasPerTabs.map((tab) => ({
            ...tab,
            cards: tab.cards.filter((task) =>
                task.anggota_card_list.some(
                    (anggota) => anggota.user.id === selectedUser.id
                )
            ),
        }));
    }, [selectedUser, tugasPerTabs]);

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head>
                <title>Laporan Kinerja Tim</title>
                {/* CSS untuk scrollbar yang lebih modern */}
                <style>{`
                    .styled-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                    .styled-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                    .styled-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                    .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                `}</style>
            </Head>
            <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50 p-4 lg:p-6 gap-6">

                {/* Sidebar Kontrol */}
                <aside className="w-full lg:w-80 lg:flex-shrink-0 bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-5 h-fit border border-gray-200/80">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Laporan Tim</h2>
                        <p className="text-sm text-gray-500">Analisis kinerja per anggota.</p>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Bulan Ini">Periode: Bulan Ini</option>
                            <option value="Bulan Lalu">Periode: Bulan Lalu</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                           <ChevronDown size={18}/>
                        </span>
                    </div>

                    <div className="border-t border-gray-200 -mx-5"/>

                    <div>
                        <label htmlFor="search-member" className="text-sm font-semibold text-gray-700 block mb-2">Pilih Anggota</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={18} />
                            </span>
                            <input
                                id="search-member" type="text" placeholder="Cari anggota..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        {filteredTeamData.length > 0 ? (
                            <MemberList
                                members={filteredTeamData}
                                selectedUser={selectedUser}
                                onSelectUser={setSelectedUser}
                            />
                        ) : (
                            <div className="text-center p-6 bg-gray-50 rounded-lg">
                                <UserX className="mx-auto text-gray-400 mb-2" size={32}/>
                                <p className="text-sm font-semibold text-gray-600">Anggota tidak ditemukan</p>
                                <p className="text-xs text-gray-500">Coba kata kunci lain.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Konten Utama */}
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
                                    <TugasCard tabs={filteredTugasTabs} />
                                </div>
                                <div className="xl:col-span-2">
                                    <PenghambatCard />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200/80 min-h-[50vh]">
                            <div className="text-center">
                                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800">Silakan Pilih Anggota Tim</h3>
                                <p className="text-gray-500 mt-1 max-w-xs">
                                    Pilih anggota dari daftar di sebelah kiri untuk melihat detail laporan.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </Proyek>
    );
}