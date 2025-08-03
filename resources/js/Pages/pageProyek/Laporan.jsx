import Proyek from "../Proyek";
import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function Laporan({ dashboardId, activePage }) {
  // Data dummy tim
  const teamData = [
    {
      id: 1,
      name: "Fikri",
      role: "IT Support",
      team: "Tim Jaya Abadi",
      rating: 4,
      progress: [
        { name: "Belum", value: 20, color: "#4B5563" },
        { name: "Dikerjakan", value: 10, color: "#3B82F6" },
        { name: "Terlambat", value: 3, color: "#EF4444" },
        { name: "Selesai", value: 30, color: "#10B981" },
      ],
      tasks: {
        Terlambat: [
          { date: "21 Juli 2025", task: "Membuat laporan server mingguan" },
        ],
        Dikerjakan: [
          { date: "15 Juli 2025", task: "Monitoring jaringan harian" },
        ],
        Belum: [{ date: "10 Juli 2025", task: "Setup PC kantor baru" }],
        Selesai: [
          { date: "5 Juli 2025", task: "Backup data bulanan" },
          { date: "2 Juli 2025", task: "Update software router" },
        ],
      },
    },
    {
      id: 2,
      name: "Sahrul Maulidi",
      role: "Marketing",
      team: "Tim Jaya Abadi",
      rating: 5,
      progress: [
        { name: "Belum", value: 28, color: "#4B5563" },
        { name: "Dikerjakan", value: 11, color: "#3B82F6" },
        { name: "Terlambat", value: 4, color: "#EF4444" },
        { name: "Selesai", value: 52, color: "#10B981" },
      ],
      tasks: {
        Terlambat: [
          { date: "23 Juni 2025", task: "Membuat laporan bulanan" },
          { date: "21 April 2025", task: "Membuat flow chart" },
        ],
        Dikerjakan: [
          { date: "10 Juni 2025", task: "Persiapan presentasi klien" },
        ],
        Belum: [{ date: "15 Mei 2025", task: "Riset pasar baru" }],
        Selesai: [
          { date: "5 Mei 2025", task: "Kampanye sosial media" },
          { date: "1 Mei 2025", task: "Update materi promosi" },
        ],
      },
    },
  ];

  const [selectedUser, setSelectedUser] = useState(teamData[1]);
  const [selectedTab, setSelectedTab] = useState("Terlambat");

  return (
    <Proyek dashboardId={dashboardId} activePage={activePage}>
      <div className="flex w-full h-screen bg-gray-100 p-4 gap-4">
        {/* === Sidebar Tim === */}
        <div className="w-1/4 bg-white rounded-2xl shadow p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-3">Tim Jaya Abadi</h2>
          <input
            type="text"
            placeholder="Cari di sini"
            className="w-full p-2 border rounded-lg mb-3 text-sm"
          />
          <div className="flex flex-col gap-2 overflow-y-auto">
            {teamData.map((member) => (
              <div
                key={member.id}
                onClick={() => {
                  setSelectedUser(member);
                  setSelectedTab("Terlambat");
                }}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                  selectedUser.id === member.id
                    ? "bg-blue-200"
                    : "hover:bg-blue-100"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
                <span>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === Konten Utama === */}
        <div className="flex-1 flex flex-col gap-4">
          {/* === Header Laporan === */}
          <div className="grid grid-cols-3 gap-4">
            {/* Laporan Kinerja (2 kolom) */}
            <div className="col-span-2 bg-white rounded-2xl shadow p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">
                Laporan Kinerja Untuk :
              </p>

              <div className="flex items-center justify-between">
                {/* Foto + Nama + Role */}
                <div className="flex items-center gap-4">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpQlcvIG6zkq4HlnHP0bX00SYzGexaxgUeSg&s"
                    alt="avatar"
                    className="w-14 h-14 rounded-full border"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold leading-tight">
                      {selectedUser.name}
                    </h3>
                    <span className="text-xs bg-blue-900 text-white px-3 py-0.5 rounded-md mt-1 inline-block">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {/* Kotak Rating */}
                <div className="border rounded-xl px-4 py-2 flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">Cukup</span>
                  <div className="flex text-lime-400 text-lg">
                    {"★".repeat(selectedUser.rating)}
                  </div>
                </div>
              </div>

              {/* Tim Info */}
              <p className="text-xs text-gray-400 mt-1">
                Tim :{" "}
                <span className="text-black font-semibold">
                  {selectedUser.team}
                </span>
              </p>
            </div>

            {/* Progres Tugas (1 kolom) */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
              <h4 className="font-semibold mb-3">Ringkasan Progres Tugas :</h4>
              <div className="flex items-center">
                <PieChart width={140} height={140}>
                  <Pie
                    data={selectedUser.progress}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {selectedUser.progress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>

                <div className="ml-4 flex flex-col gap-2">
                  {selectedUser.progress.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-700">
                        {item.name} : {item.value}({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* === Tugas & Saran === */}
          <div className="flex gap-4">
            {/* Tabs Tugas */}
            <div className="flex-1 bg-white rounded-2xl shadow p-4">
              <div className="flex gap-2 mb-4">
                {["Terlambat", "Dikerjakan", "Belum", "Selesai"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTab === tab
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* List Tugas */}
              <div className="flex flex-col gap-4">
                {selectedUser.tasks[selectedTab].map((item, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="font-semibold">{item.task}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saran */}
            <div className="w-1/3 bg-white rounded-2xl shadow p-4">
              <h4 className="font-semibold mb-2">Saran :</h4>
              <p className="text-sm text-gray-600">
                Saran dibuat otomatis oleh sistem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Proyek>
  );
}
