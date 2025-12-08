import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { FaStar, FaCrown, FaSearch } from "react-icons/fa";
import { LuMedal } from "react-icons/lu";
import { HiOutlineUserGroup } from "react-icons/hi";
import Dashboard, { DashboardState } from "../Dashboard";

export default function ContentLeaderboard() {
  return (
    <Dashboard>
      <Leaderboard />
    </Dashboard>
  );
}

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

function PodiumCard({ user }) {
  const details = getPodiumDetails(user.rank);
  const Icon = details.icon;
  
  const avatarSrc = user.poto_profile_user 
    ? user.poto_profile_user 
    : `https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=${details.bg.replace('bg-', '')}&color=fff&size=128`;

  return (
    // Tambahkan class w-full max-w-sm agar kartu tidak terlalu lebar saat sendiri
    <div className={`flex flex-col items-center p-4 sm:p-6 bg-white rounded-2xl shadow-xl ${details.border} border-b-[6px] transition-transform duration-300 hover:scale-105 ${details.order} ${details.animation} relative overflow-visible w-full max-w-[16rem]`}>
      
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ${details.bg} p-1 flex items-center justify-center border-4 border-white shadow-md`}>
        <img 
          src={avatarSrc} 
          alt={user.name} 
          className="w-full h-full rounded-full object-cover border-2 border-white" 
        />
        <div className={`absolute -top-4 ${details.text} drop-shadow-sm`}>
          <Icon size={36} />
        </div>
        
        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full ${details.bg} flex items-center justify-center text-white text-lg font-extrabold border-[3px] border-white shadow-sm`}>
          {user.rank}
        </div>
      </div>

      <h3 className="mt-5 text-lg sm:text-xl font-bold text-gray-800 text-center truncate w-full px-2">{user.name}</h3>
      
      <div className="flex items-center gap-1 mt-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
        {[...Array(user.rating_bintang || 0)].map((_, i) => <FaStar key={i} size={14} />)}
      </div>

      <div className="mt-5 text-center">
        <span className={`text-3xl sm:text-4xl font-extrabold ${details.text}`}>{user.tasks}</span>
        <span className="block text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Tugas Selesai</span>
      </div>
    </div>
  );
}

function UserRow({ user }) {
  const avatarSrc = user.poto_profile_user 
    ? user.poto_profile_user 
    : `https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=c7d2fe&color=3730a3&size=64`;

  return (
    <div className="flex items-center p-3 sm:p-4 bg-white border-b border-gray-100 transition-all hover:bg-indigo-50/50 first:rounded-t-xl last:rounded-b-xl last:border-b-0">
      <span className="w-12 text-center text-lg font-bold text-indigo-300">{user.rank}</span>
      <div className="flex items-center gap-3 sm:gap-4 flex-grow ml-2">
        <img 
          src={avatarSrc} 
          alt={user.name} 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm bg-indigo-100" 
        />
        <div>
          <span className="font-bold text-base text-gray-800 block">{user.name}</span>
          <div className="flex text-amber-500 mt-1">
            {[...Array(user.rating_bintang || 0)].map((_, i) => <FaStar key={i} size={14} />)}
          </div>
        </div>
      </div>
      <div className="text-right pr-4">
        <span className="font-extrabold text-xl text-indigo-600">{user.tasks}</span>
        <span className="text-xs block font-medium text-gray-400 uppercase mt-0.5">Tugas</span>
      </div>
    </div>
  );
}

function Leaderboard() {
  const { activePage, leaderboardData } = usePage().props; 
  const { setActivePage } = DashboardState();

  useEffect(() => {
    if (activePage && setActivePage) setActivePage(activePage);
  }, [activePage, setActivePage]);

  const [search, setSearch] = useState("");

  const filteredData = (leaderboardData || []) 
    .map((user, index) => ({ ...user, rank: index + 1 }))
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );

  const topThree = filteredData.filter((user) => user.rank <= 3);
  const restOfUsers = filteredData.filter((user) => user.rank > 3);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-1 py-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Papan Peringkat Tim</h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Apresiasi untuk anggota dengan kinerja terbaik berdasarkan penyelesaian tugas tepat waktu.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-12 max-w-md mx-auto">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            className="w-full py-3 pl-12 pr-4 bg-white border-2 border-indigo-100 rounded-full text-base focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-gray-700 placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* --- PERBAIKAN LOGIKA LAYOUT --- */}
        {/* Menggunakan kondisi: jika topThree hanya 1, gunakan flex center. Jika lebih, gunakan grid */}
        {topThree.length > 0 && (
          <div className={`gap-6 lg:gap-8 items-end mb-12 sm:mb-16 px-2 sm:px-8 ${
              topThree.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 md:grid-cols-3'
          }`}>
            {topThree.length === 1 ? (
                // Jika hanya 1 user, langsung tampilkan ranking 1 di tengah
                <PodiumCard key={topThree[0].rank} user={topThree[0]} />
            ) : (
                // Jika lebih dari 1 user, gunakan layout podium standar (2 - 1 - 3)
                <>
                    {topThree[1] && <PodiumCard key={topThree[1].rank} user={topThree[1]} />}
                    {topThree[0] && <PodiumCard key={topThree[0].rank} user={topThree[0]} />}
                    {topThree[2] && <PodiumCard key={topThree[2].rank} user={topThree[2]} />}
                </>
            )}
          </div>
        )}
        {/* ---------------------------------- */}

        {/* General Ranking List */}
        {restOfUsers.length > 0 && (
          <div className="max-w-3xl mx-auto">
             <h2 className="text-xl font-bold text-gray-800 mb-5 px-2 flex items-center gap-2">
                <HiOutlineUserGroup className="text-indigo-500"/>
                Peringkat Lainnya
             </h2>
             <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {restOfUsers.map((user) => (
                   <UserRow key={user.rank} user={user} />
                ))}
             </div>
          </div>
        )}

        {/* Pesan jika tidak ada data sama sekali */}
        {(leaderboardData || []).length === 0 && search === '' && (
          <div className="text-center text-gray-500 py-16 sm:py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineUserGroup className="h-10 w-10 text-indigo-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Belum Ada Data Peringkat</p>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Papan peringkat akan diperbarui secara otomatis setelah anggota tim mulai menyelesaikan tugas mereka.
            </p>
          </div>
        )}

        {filteredData.length === 0 && search !== '' && (
          <div className="text-center text-gray-500 py-16 sm:py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="h-9 w-9 text-red-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Anggota tidak ditemukan</p>
            <p className="text-gray-500">
              Kami tidak dapat menemukan anggota dengan nama "<span className="font-semibold text-indigo-600">{search}</span>".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}