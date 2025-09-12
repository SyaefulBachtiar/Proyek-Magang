import { Head } from "@inertiajs/react";
import Proyek from "../Proyek";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// --- Helper Icons (Komponen Ikon SVG untuk tampilan lebih bersih) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);


// --- Komponen-komponen Kecil untuk Merapikan Tampilan ---

// 1. Komponen untuk daftar anggota di sidebar
const MemberList = ({ members, selectedUser, onSelectUser }) => (
  <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-2">
    {members.length > 0 ? (
      members.map((member) => (
        <div
          key={member.id}
          onClick={() => onSelectUser(member)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedUser?.id === member.id
              ? "bg-blue-100 text-blue-800 font-semibold shadow-sm"
              : "hover:bg-gray-100"
          }`}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=random&color=fff&size=32`}
            alt={member.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <span className="text-sm truncate">{member.name}</span>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-500 text-center p-4">Anggota tidak ditemukan.</p>
    )}
  </div>
);

// 2. Komponen untuk header utama (Info Kinerja & Pie Chart)
const ReportHeader = ({ user }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Laporan Kinerja */}
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Laporan Kinerja Untuk:</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=random&color=fff&size=64`}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-gray-100"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <span className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full mt-1.5 inline-block font-medium">
                {user.role}
              </span>
            </div>
          </div>
          <div className="text-center border rounded-xl px-4 py-2">
            <span className="text-xs text-gray-500 mb-1.5 block">Rating Kinerja</span>
            <div className="flex text-yellow-400 text-2xl">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={i < user.rating ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">
        Tim: <span className="text-gray-900 font-semibold">{user.team}</span>
      </p>
    </div>

    {/* Ringkasan Progres Tugas */}
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h4 className="font-semibold text-gray-800 mb-3 text-base">Ringkasan Progres</h4>
      <div className="flex items-center h-full">
        <div className="w-36 h-36">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
                <Pie data={user.progress} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={3} cornerRadius={5}>
                    {user.progress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                    ))}
                </Pie>
            </PieChart>
           </ResponsiveContainer>
        </div>
        <div className="ml-6 flex flex-col gap-2.5">
            {user.progress.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 text-sm">
                    <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}:</span>
                    <span className="font-medium text-gray-800">{item.value}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  </div>
);

// 3. Komponen untuk panel Tugas (Tabs, List Tugas, dan Saran)
const TaskPanel = ({ user }) => {
    const [selectedTab, setSelectedTab] = useState("Terlambat");
    const taskCategories = ["Terlambat", "Dikerjakan", "Belum", "Selesai"];

    return(
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
                 <div className="flex border-b border-gray-200 mb-4">
                    {taskCategories.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          selectedTab === tab
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {tab} <span className="text-xs bg-gray-200 rounded-full px-1.5 py-0.5">{user.tasks[tab]?.length || 0}</span>
                      </button>
                    ))}
                 </div>

                 <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-2">
                    {user.tasks[selectedTab] && user.tasks[selectedTab].length > 0 ? (
                        user.tasks[selectedTab].map((item, i) => (
                        <div key={i} className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/80">
                            <p className="text-xs text-gray-500 mb-0.5">{item.date}</p>
                            <p className="font-semibold text-gray-800">{item.task}</p>
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center pt-10">Tidak ada tugas dalam kategori ini.</p>
                    )}
                 </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
                <h4 className="font-semibold text-gray-800 mb-2">Saran & Rekomendasi</h4>
                <p className="text-sm text-gray-600">
                    Saran yang dibuat otomatis oleh sistem akan muncul di sini untuk membantu meningkatkan produktivitas.
                </p>
            </div>
         </div>
    );
}

// --- Komponen Utama ---
export default function Laporan({ dashboardId, activePage, tim, anggotaTim }) {
  // Fungsi untuk menghasilkan data dummy yang lebih bervariasi
  const generateFullTeamData = (members) => {
    return members.map(member => ({
      ...member,
      team: tim.nama_tim,
      rating: Math.floor(Math.random() * 3) + 3,
      progress: [
        { name: "Belum", value: Math.floor(Math.random() * 20) + 5, color: "#6B7280" },
        { name: "Dikerjakan", value: Math.floor(Math.random() * 15) + 5, color: "#3B82F6" },
        { name: "Terlambat", value: Math.floor(Math.random() * 5) + 1, color: "#EF4444" },
        { name: "Selesai", value: Math.floor(Math.random() * 30) + 10, color: "#10B981" },
      ],
      tasks: {
        Terlambat: [{ date: "24 Agu 2025", task: "Memperbaiki bug di halaman login" }],
        Dikerjakan: [{ date: "15 Sep 2025", task: "Menyiapkan materi presentasi klien" }],
        Belum: [{ date: "30 Sep 2025", task: "Riset kompetitor untuk fitur baru" }],
        Selesai: [{ date: "05 Agu 2025", task: "Update dokumentasi API" }, { date: "01 Agu 2025", task: "Melakukan deployment v1.2" }],
      },
    }));
  };
  
  const teamData = useMemo(() => generateFullTeamData(anggotaTim), [anggotaTim]);
  const [selectedUser, setSelectedUser] = useState(teamData[0] || null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeamData = teamData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
      <Head title="Laporan"/>
      <div className="flex w-full min-h-screen bg-gray-50 p-4 lg:p-6 gap-6">
        {/* === Sidebar Tim === */}
        <aside className="w-full max-w-xs bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Laporan Tim</h2>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Periode: Bulan Ini</option>
                <option>Periode: Bulan Lalu</option>
              </select>
              <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Pilih Anggota</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Cari anggota..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
             <MemberList members={filteredTeamData} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
          </div>
        </aside>

        {/* === Konten Utama === */}
        <main className="flex-1 flex flex-col gap-4">
          {selectedUser ? (
            <>
              <ReportHeader user={selectedUser} />
              <TaskPanel user={selectedUser} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">Tidak Ada Anggota Tim</h3>
                <p className="text-gray-500 mt-1">Silakan tambahkan anggota ke tim ini untuk melihat laporan.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </Proyek>
  );
}