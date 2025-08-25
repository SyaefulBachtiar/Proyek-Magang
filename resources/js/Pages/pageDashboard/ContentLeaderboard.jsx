import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { FaStar, FaCrown, FaSearch } from "react-icons/fa";
import { LuMedal } from "react-icons/lu";
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

// Komponen utama Leaderboard dengan tampilan minimalis
function Leaderboard() {
  const { activePage } = usePage().props;
  const { setActivePage } = DashboardState();

  useEffect(() => {
    if (activePage && setActivePage) {
      setActivePage(activePage);
    }
  }, [activePage, setActivePage]);

  const allData = [
    { name: "Sahrul Maulidi", tasks: 10 },
    { name: "Syaeful B", tasks: 9 },
    { name: "M Fikri", tasks: 8 },
    { name: "Agus", tasks: 8 },
    { name: "Ahmad", tasks: 6 },
    { name: "Budi Santoso", tasks: 5 },
    { name: "Citra Lestari", tasks: 4 },
  ];

  const [search, setSearch] = useState("");

  const filteredData = allData
    .map((user, index) => ({ ...user, rank: index + 1 }))
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );

  // ✨ Fungsi untuk mendapatkan ikon peringkat dengan warna aksen
  const getRankIcon = (rank) => {
    // Warna ikon utama adalah indigo-500
    const iconColor = "text-indigo-500";
    if (rank === 1) return <FaCrown className={iconColor} size={20} />;
    if (rank <= 3) return <LuMedal className={iconColor} size={18} />;
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Papan Peringkat</h1>
          <p className="text-gray-500 mt-1">
            Kinerja anggota teratas bulan ini.
          </p>
        </div>

        {/* 🔍 Search Input */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            className="w-full py-2 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Leaderboard List */}
        <div className="flex flex-col gap-2">
          {filteredData.map((user) => (
            <div
              key={user.rank}
              className={`
                p-4 flex items-center justify-between rounded-lg transition-all duration-200
                ${
                  user.rank <= 3
                    ? 'bg-indigo-50 border-l-4 border-indigo-500 shadow-sm'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-4">
               
                <span className={`text-lg font-bold w-6 text-center ${user.rank <= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {user.rank}
                </span>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user.rank <= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {user.name.charAt(0)}
                </div>

                {/* Nama dan Bintang */}
                <div>
                  <span className="font-bold text-base text-gray-800">{user.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getRankIcon(user.rank)}
                    <div className="flex text-amber-500">
                      {[...Array(getStarRating(user.tasks))].map((_, i) => (
                        <FaStar key={i} size={14} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Jumlah Tugas */}
              <div className="text-right">
                <span className="font-bold text-lg text-indigo-600">
                    {user.tasks}
                </span>
                <span className="text-xs block text-gray-500">
                    Tugas
                </span>
              </div>
            </div>
          ))}

          {/* Pesan jika tidak ditemukan */}
          {filteredData.length === 0 && (
            <div className="text-center text-gray-500 py-10 bg-white rounded-lg border border-gray-200">
              <p className="font-semibold">Anggota tidak ditemukan</p>
              <p className="text-sm mt-1">
                Coba gunakan kata kunci pencarian yang lain.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}