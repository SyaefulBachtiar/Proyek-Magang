import { Head, router } from "@inertiajs/react";
import Proyek from "../Proyek";
import { useState, useMemo, useEffect, useRef } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
    AlertTriangle, Calendar, CheckCircle2, ChevronDown, ClipboardList, Coffee, Hourglass, Lightbulb, ListTodo,
    Rocket, Search, ShieldAlert, Sparkles, Star, ThumbsUp, UserX, Users, Wrench
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const iconMap = {
    Rocket, ThumbsUp, Lightbulb, Wrench, ShieldAlert, Sparkles, Coffee
};

const StarIcon = ({ filled }) => (
  <Star className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill={filled ? 'currentColor' : 'none'} />
);

const KinerjaCard = ({ user, startDate, endDate }) => {
    const getRatingColorClasses = (label) => {
        if (!label) return 'bg-gray-100 text-gray-800';
        switch (label.toLowerCase()) {
            case 'sangat bagus':
            case 'bagus':
                return 'bg-green-100 text-green-800';
            case 'cukup':
                return 'bg-yellow-100 text-yellow-800';
            case 'kurang':
            case 'buruk':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const periodeDisplay = useMemo(() => {
        if (startDate && endDate) {
            const options = { day: 'numeric', month: 'short' };
            const start = startDate.toLocaleDateString('id-ID', options);
            const end = endDate.toLocaleDateString('id-ID', options);
            return `${start} - ${end}`;
        }
        return "Periode Ini"; 
    }, [startDate, endDate]);

    return (
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between h-full border border-blue-700">
            <div>
                <h3 className="text-sm font-semibold text-blue-100 mb-4">Laporan Kinerja</h3>
                <div className="flex items-center gap-4">
                    <img src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=c7d2fe&color=3730a3&size=48`} alt={user.name} className="w-12 h-12 rounded-full"/>
                    <div>
                        <p className="font-bold text-white text-lg">{user.name}</p>
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-sm font-semibold">{user.role}</span>
                    </div>
                </div>
                <p className="text-sm text-blue-100 mt-3 flex items-center gap-2">
                    <Users size={14} />
                    Tim: <span className="font-semibold text-white">{user.team}</span>
                </p>
            </div>
            <div className="mt-5 pt-4 border-t border-blue-400/50 flex items-center justify-between">
                <div className="text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getRatingColorClasses(user.rating_label)}`}>
                        {user.rating_label}
                    </span>
                    <div className="flex justify-center mt-2 gap-0.5">
                        {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < user.rating_bintang} />)}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-100">Periode</p>
                    <p className="font-semibold text-white">{periodeDisplay}</p>
                </div>
            </div>
        </div>
    );
};

const RingkasanCard = ({ user, tugasPerTabs }) => {
    const calculateProgressData = () => {
        if (!user || !tugasPerTabs) {
            return [];
        }

        const counts = {
            start: 0,
            progress: 0,
            terlambat: 0,
            selesai: 0,
        };

        tugasPerTabs.forEach(tab => {
             tab.cards.forEach(task => {
                const isUserInvolved = task.anggota_card_list.some(
                    anggota => anggota.user.id === user.id
                );
                if (isUserInvolved) {
                    if (tab.id === 'start') counts.start++;
                    else if (tab.id === 'progress') counts.progress++;
                    else if (tab.id === 'terlambat') counts.terlambat++;
                    else if (tab.id === 'selesai') counts.selesai++;
                }
            });
        });

        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

        return [
            { name: "Belum", value: counts.start, color: "#fcd34d", percentage: total > 0 ? Math.round((counts.start / total) * 100) : 0 },
            { name: "Dikerjakan", value: counts.progress, color: "#7DD3FC", percentage: total > 0 ? Math.round((counts.progress / total) * 100) : 0 },
            { name: "Terlambat", value: counts.terlambat, color: "#FDA4AF", percentage: total > 0 ? Math.round((counts.terlambat / total) * 100) : 0 },
            { name: "Selesai", value: counts.selesai, color: "#D9F99D", percentage: total > 0 ? Math.round((counts.selesai / total) * 100) : 0 },
        ].filter(item => item.value > 0);
    };

    const progressData = useMemo(calculateProgressData, [user, tugasPerTabs]);

    const chartData = {
        labels: progressData.map(item => item.name),
        datasets: [{
            data: progressData.map(item => item.value),
            backgroundColor: progressData.map(item => item.color),
            borderColor: '#059669',
            borderWidth: 4,
        }],
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '50%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true, backgroundColor: '#000', cornerRadius: 6, displayColors: true, boxPadding: 4, callbacks: { label: (c) => `${c.label}: ${c.raw} tugas` } },
        },
    };

    return (
        <div className="bg-emerald-600 p-5 rounded-xl shadow-sm h-full">
            <h3 className="font-bold text-white mb-2">Ringkasan Tugas Realtime</h3>
            <div className="flex items-center h-full -mt-2">
                {progressData.length > 0 ? (
                    <>
                        <div className="w-32 h-32 flex-shrink-0">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                        <div className="ml-4 flex flex-col gap-1.5">
                            {progressData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-emerald-100 font-medium">
                                        {item.name}: {item.value} ({item.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="text-center text-emerald-200">
                            <Coffee size={32} className="mx-auto mb-2 text-emerald-300" />
                            <p className="text-sm font-semibold text-white">Tidak Ada Tugas</p>
                            <p className="text-xs">User ini belum memiliki tugas.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SaranCard = ({ user }) => {
    const IconComponent = iconMap[user.saran_ikon] || Lightbulb;
   
    const colorClasses = {
        green: 'bg-green-600 border-green-700 text-green-50',
        indigo: 'bg-indigo-600 border-indigo-700 text-indigo-100',
        amber: 'bg-amber-600 border-amber-700 text-amber-50',
        red: 'bg-red-600 border-red-700 text-red-50',
        sky: 'bg-sky-600 border-sky-700 text-sky-50',
    };
    const cardColor = colorClasses[user.saran_warna] || colorClasses.indigo;

    return (
        <div className={`${cardColor} p-6 rounded-2xl shadow-sm h-full flex flex-col items-start border transition-colors duration-300`}>
            <div className="bg-white/20 p-2 rounded-lg mb-4">
                <IconComponent size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Saran & Rekomendasi</h3>
            <p className="text-sm leading-relaxed">
                {user.saran_teks}
            </p>
        </div>
    );
};

const TugasCard = ({ tabs }) => {
    const firstTabWithTasks = tabs.find((t) => t.cards.length > 0)?.id || tabs[0]?.id || "";
    const [activeTab, setActiveTab] = useState(firstTabWithTasks);

     useEffect(() => {
        const firstTab = tabs.find((t) => t.cards.length > 0)?.id || tabs[0]?.id || "";
        setActiveTab(firstTab);
    }, [tabs]);


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
        <div className="bg-amber-300 p-5 rounded-2xl shadow-sm h-full flex flex-col border border-gray-200/80">
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-3 border-b border-gray-200 styled-scrollbar">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${activeTab === tab.id ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {tab.id === "selesai" && <CheckCircle2 size={16} />}
                        {tab.id === "terlambat" && <AlertTriangle size={16} />}
                        {tab.judul}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                            {tab.cards.length}
                        </span>
                    </button>
                ))}
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-80 pr-2 flex-1 styled-scrollbar">
                {activeTabData?.cards?.length > 0 ? (
                    activeTabData.cards.map((task) => <TaskItem key={task.id} task={task} />)
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center text-sm p-8  text-amber-100 rounded-lg">
                        <Coffee size={36} className="mb-4 text-amber-200" />
                        <p className="font-semibold text-white text-base">Tidak Ada Tugas</p>
                        <p>Anda bisa beristirahat sejenak di kategori ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PenghambatCard = ({ data, tim, dashboardId }) => {

    const StatItem = ({ icon, value, label, subLabel, task, colorClass }) => {
        
        const handleTaskClick = () => {
            if (task && task.id) {
                router.visit(route('proyek.card', {
                    id: dashboardId,
                    id_tim: tim.id,
                    cardId: task.id
                }));
            }
        };

        return (
            <div className="flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                            {icon}
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${colorClass.text}`}>{value}</p>
                            <p className="text-sm font-semibold text-white">{label}</p>
                        </div>
                    </div>
                    <p className="text-xs text-rose-200 mt-2 ml-12">{subLabel}</p>
                </div>
                {task ? (
                     <div className="mt-4 pt-4 border-t border-rose-400/50">
                        <p className="text-xs font-semibold text-rose-100">Tugas Paling Kritis</p>
                        <p 
                            onClick={handleTaskClick} 
                            className="text-sm text-blue-400 mt-1 truncate cursor-pointer hover:underline"
                            title={task.nama_card}
                        >
                            {task.nama_card}
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 pt-4 border-t border-rose-400/50">
                        <p className="text-xs font-semibold text-rose-100">Tugas Paling Kritis</p>
                        <p className="text-sm text-rose-300 mt-1">Tidak ada data</p>
                    </div>
                )}
            </div>
        );
    };

    const hasBlockers = data?.mengendap?.jumlah > 0 || data?.terlambat_kritis?.jumlah > 0;

    return (
        <div className="bg-rose-500 p-6 rounded-2xl shadow-sm h-full border border-rose-700">
            <h3 className="text-sm font-semibold text-rose-100 mb-5">Potensi Penghambat</h3>
            {hasBlockers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 h-full">
                    <StatItem
                        icon={<Hourglass size={20} className="text-amber-600"/>}
                        value={data.mengendap.jumlah}
                        label="Tugas Mengendap"
                        subLabel={`> ${data.mengendap.threshold_hari} hari tidak update`}
                        task={data.mengendap.tugas_terlama}
                        colorClass={{ text: 'text-amber-500', bg: 'bg-amber-100' }}
                        tim={tim} dashboardId={dashboardId}
                    />
                    <StatItem
                        icon={<AlertTriangle size={20} className="text-red-600"/>}
                        value={data.terlambat_kritis.jumlah}
                        label="Terlambat Kritis"
                        subLabel={`> ${data.terlambat_kritis.threshold_hari} hari dari tenggat`}
                        task={data.terlambat_kritis.tugas_paling_terlambat}
                        colorClass={{ text: 'text-red-500', bg: 'bg-red-100' }}
                        tim={tim} dashboardId={dashboardId}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <CheckCircle2 size={40} className="text-green-400 mb-3" />
                    <p className="font-semibold text-white">Semua Berjalan Lancar!</p>
                    <p className="text-sm text-rose-200 mt-1">Tidak ada tugas yang terdeteksi sebagai penghambat.</p>
                </div>
            )}
        </div>
    );
};

const MemberList = ({ members, selectedUser, onSelectUser }) => (
  <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-2 styled-scrollbar">
    {members.map((member) => (
      <div key={member.id} onClick={() => onSelectUser(member)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${selectedUser?.id === member.id ? "bg-blue-600 text-white font-semibold shadow-md" : "text-gray-700 hover:bg-gray-100"}`}>
        <img src={`https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=32`} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
        <span className="text-sm truncate">{member.name}</span>
      </div>
    ))}
  </div>
);


export default function Laporan({ dashboardId, activePage, tim, anggotaTim, tugasPerTabs, id_board, penghambat }) {

    // Realtime update listener
    useEffect(() => {
        if (!id_board) return;
        const channel = window.Echo.private(`board.${id_board}`);
        channel.listen('.board.updated', () => {
            router.reload({
                only: ["tugasPerTabs", "anggotaTim", "tim", "penghambat"],
                preserveState: true,
                preserveScroll: true,
            });
        });
        return () => {
            window.Echo.leave(`board.${id_board}`);
        }
    }, [id_board]);

    const teamData = useMemo(() => anggotaTim, [anggotaTim]);

    const [selectedUser, setSelectedUser] = useState(teamData[0] || null);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const datePickerRef = useRef(null);
    const triggerRef = useRef(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    useEffect(() => {
        if (startDate && endDate) {
            const formatDate = (date) => date.toISOString().split('T')[0];

            router.get(
                route('proyek.laporan', { id: dashboardId, id_tim: tim.id }),
                {
                    start_date: formatDate(startDate),
                    end_date: formatDate(endDate),
                },
                {
                    preserveState: true,
                    replace: true,
                    onSuccess: () => {
                        setIsPickerOpen(false);
                    }
                }
            );
        }
    }, [dateRange]);

     useEffect(() => {
        function handleClickOutside(event) {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    useEffect(() => {
        if (teamData.length > 0 && !teamData.some(member => member.id === selectedUser?.id)) {
            setSelectedUser(teamData[0]);
        } else if (teamData.length === 0) {
            setSelectedUser(null);
        } else if (selectedUser) {
            const updatedSelectedUser = teamData.find(member => member.id === selectedUser.id);
            if (updatedSelectedUser) {
                setSelectedUser(updatedSelectedUser);
            }
        }
    }, [teamData]);

    const formatDateRangeText = () => {
        if (!startDate || !endDate) {
            return "Pilih Periode Tanggal";
        }
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`;
    };

    return (
        <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
            <Head>
                <title>Laporan Kinerja Tim</title>
                <style>{`
                    .styled-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                    .styled-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                    .styled-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                    .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                    .react-datepicker { font-family: 'Inter', sans-serif; border-radius: 0.75rem; border-color: #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .react-datepicker__header { background-color: #f9fafb; border-bottom-color: #e5e7eb; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem;}
                    .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { font-weight: 600; color: #1f2937; }
                    .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name { color: #4b5563; }
                    .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range { background-color: #3b82f6; color: white; }
                    .react-datepicker__day--selected:hover, .react-datepicker__day--in-range:hover { background-color: #2563eb; }
                    .react-datepicker__day--keyboard-selected { background-color: #dbeafe; color: #1e40af; }
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
                        <button
                            ref={triggerRef}
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-left bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center"
                        >
                            <span className="truncate">{formatDateRangeText()}</span>
                            <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                        </button>

                        {isPickerOpen && (
                            <div ref={datePickerRef} className="absolute top-full mt-2 z-50">
                                <DatePicker
                                    selectsRange={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(update) => setDateRange(update)}
                                    inline
                                />
                            </div>
                        )}
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
                                <KinerjaCard user={selectedUser} startDate={startDate} endDate={endDate} />
                                <RingkasanCard
                                    user={selectedUser}
                                    tugasPerTabs={tugasPerTabs}
                                />
                                <SaranCard user={selectedUser} />
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                                <div className="xl:col-span-3">
                                    <TugasCard tabs={filteredTugasTabs} />
                                </div>
                                <div className="xl:col-span-2">
                                    <PenghambatCard data={penghambat} tim={tim} dashboardId={dashboardId} />
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