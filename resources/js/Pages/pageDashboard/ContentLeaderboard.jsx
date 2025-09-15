import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { FaStar, FaCrown, FaSearch } from "react-icons/fa";
import { LuMedal } from "react-icons/lu";
import { HiOutlineUserGroup } from "react-icons/hi";
import Dashboard, { DashboardState } from "../Dashboard";

// Komponen Wrapper (Tidak ada perubahan)
export default function ContentLeaderboard() {
  return (
    <Dashboard>
      <Leaderboard />
    </Dashboard>
  );
}

// Helper function untuk bintang (Tidak ada perubahan)
const getStarRating = (tasks) => {
  if (tasks >= 10) return 5;
  if (tasks >= 8) return 4;
  if (tasks >= 6) return 3;
  if (tasks >= 4) return 2;
  return 1;
};

// ✨ [BARU] Helper function untuk detail podium
const getPodiumDetails = (rank) => {
  switch (rank) {
    case 1:
      return {
        icon: FaCrown,
        color: "amber",
        shadow: "shadow-amber-500/40",
        text: "text-amber-500",
        bg: "bg-amber-400",
        border: "border-amber-500",
        order: "order-1 md:order-2",
        animation: "transform md:-translate-y-6",
      };
    case 2:
      return {
        icon: LuMedal,
        color: "slate",
        shadow: "shadow-slate-400/40",
        text: "text-slate-500",
        bg: "bg-slate-400",
        border: "border-slate-500",
        order: "order-2 md:order-1",
        animation: "",
      };
    case 3:
      return {
        icon: LuMedal,
        color: "orange",
        shadow: "shadow-orange-500/40",
        text: "text-orange-600",
        bg: "bg-orange-500",
        border: "border-orange-600",
        order: "order-3",
        animation: "",
      };
    default:
      return {};
  }
};

// ✨ [BARU] Komponen untuk kartu di Podium
function PodiumCard({ user }) {
  const details = getPodiumDetails(user.rank);
  const Icon = details.icon;

  return (
    <div className={`flex flex-col items-center p-6 bg-white rounded-xl shadow-lg ${details.border} border-b-4 transition-transform duration-300 hover:scale-105 ${details.order} ${details.animation}`}>
      <div className={`relative w-20 h-20 rounded-full ${details.bg} flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-md`}>
        {user.name.charAt(0)}
        <div className={`absolute -top-3 ${details.text}`}>
          <Icon size={32} />
        </div>
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-800 text-center truncate w-full">{user.name}</h3>
      <div className="flex items-center gap-1 mt-1 text-amber-500">
        {[...Array(getStarRating(user.tasks))].map((_, i) => <FaStar key={i} size={16} />)}
      </div>
      <div className="mt-4 text-center">
        <span className={`text-3xl font-bold ${details.text}`}>{user.tasks}</span>
        <span className="block text-sm text-gray-500">Tugas</span>
      </div>
    </div>
  );
}

// ✨ [BARU] Komponen untuk baris di daftar peringkat umum
function UserRow({ user }) {
  return (
    <div className="flex items-center p-4 bg-white border-b border-gray-200 transition-colors hover:bg-gray-50">
      <span className="w-10 text-center text-lg font-semibold text-gray-400">{user.rank}</span>
      <div className="flex items-center gap-4 flex-grow">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-600">
          {user.name.charAt(0)}
        </div>
        <div>
          <span className="font-bold text-base text-gray-800">{user.name}</span>
          <div className="flex text-amber-500 mt-1">
            {[...Array(getStarRating(user.tasks))].map((_, i) => <FaStar key={i} size={14} />)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="font-bold text-xl text-indigo-600">{user.tasks}</span>
        <span className="text-xs block text-gray-500">Tugas</span>
      </div>
    </div>
  );
}

// Komponen utama Leaderboard dengan tampilan yang disempurnakan
function Leaderboard() {
  const { activePage } = usePage().props;
  const { setActivePage } = DashboardState();

  useEffect(() => {
    if (activePage && setActivePage) setActivePage(activePage);
  }, [activePage, setActivePage]);

  // Data dan logika state tidak diubah
  const allData = [
    { name: "Sahrul Maulidi", tasks: 10 },
    { name: "Syaeful Bachri", tasks: 9 },
    { name: "Muhammad Fikri", tasks: 8 },
    { name: "Agus Setiawan", tasks: 8 },
    { name: "Ahmad Yani", tasks: 6 },
    { name: "Budi Santoso", tasks: 5 },
    { name: "Citra Lestari", tasks: 4 },
  ];

  const [search, setSearch] = useState("");

  const filteredData = allData
    .map((user, index) => ({ ...user, rank: index + 1 }))
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );

  const topThree = filteredData.filter((user) => user.rank <= 3);
  const restOfUsers = filteredData.filter((user) => user.rank > 3);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Papan Peringkat</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Kinerja anggota teratas bulan ini per tanggal {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            className="w-full py-3 pl-12 pr-4 bg-white border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm hover:shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ✨ Podium Section for Top 3 */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-end mb-12">
            {topThree.map((user) => (
              <PodiumCard key={user.rank} user={user} />
            ))}
          </div>
        )}

        {/* ✨ General Ranking List */}
        {restOfUsers.length > 0 && (
          <div>
             <h2 className="text-xl font-bold text-gray-700 mb-4 px-2">Peringkat Lainnya</h2>
             <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {restOfUsers.map((user) => (
                   <UserRow key={user.rank} user={user} />
                ))}
             </div>
          </div>
        )}

        {/* Pesan jika tidak ditemukan */}
        {filteredData.length === 0 && (
          <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-md">
            <HiOutlineUserGroup size={50} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-700">Anggota tidak ditemukan</p>
            <p className="text-base mt-1">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}