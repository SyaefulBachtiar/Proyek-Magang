import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { FaStar } from "react-icons/fa";
import { LuMedal } from "react-icons/lu";
import Dashboard, { DashboardState } from "../Dashboard";

export default function ContentLeaderboard() {
  return (
    <Dashboard>
      <Leaderboard />
    </Dashboard>
  );
}

function Leaderboard() {
  const { activePage } = usePage().props;
  const { setActivePage } = DashboardState();

  useEffect(() => {
    if (activePage && setActivePage) {
      setActivePage(activePage);
    }
  }, [activePage]);

  // Data asli sudah diurutkan berdasarkan peringkat
  const allData = [
    { name: "Sahrul Maulidi", tasks: 10 },
    { name: "Syaeful B", tasks: 9 },
    { name: "M Fikri", tasks: 8 },
    { name: "Agus", tasks: 8 },
    { name: "Ahmad", tasks: 6 },
    { name: "Ahmad", tasks: 6 },
  ];

  const [search, setSearch] = useState("");

  // Tetap gunakan peringkat asli dari index allData
  const filteredData = allData
    .map((user, index) => ({ ...user, rank: index + 1 }))
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );

  const topColors = [
    "from-red-400 to-red-500",
    "from-blue-400 to-blue-500",
    "from-green-400 to-green-500",
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Cari nama anggota..."
        className="w-full mb-5 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-300"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Leaderboard List */}
      <div className="flex flex-col gap-3">
        {filteredData.map((user, i) => (
          <div
            key={i}
            className={`rounded-xl shadow-md px-5 py-3 flex items-center justify-between ${
              user.rank <= 3
                ? `bg-gradient-to-r ${topColors[user.rank - 1]} text-white`
                : `bg-white text-gray-800`
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-bold w-6 ${
                  user.rank <= 3 ? "text-yellow-300" : "text-black"
                }`}
              >
                {user.rank}.
              </span>

              {user.rank <= 3 && (
                <LuMedal className="text-yellow-300" size={20} />
              )}

              <span className="font-semibold">{user.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex text-yellow-300 text-sm">
                {[...Array(user.tasks >= 10 ? 5 : user.tasks >= 8 ? 4 : 3)].map(
                  (_, i) => (
                    <FaStar key={i} />
                  )
                )}
              </div>
              <span className="text-sm">
                {user.tasks} Tugas Diselesaikan
              </span>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-4">
            Tidak ditemukan anggota dengan nama tersebut.
          </div>
        )}
      </div>
    </div>
  );
}
