// File: resources/js/Pages/Profile/ContentPengaturanProfila.jsx

import React, { useState } from 'react';
import Dashboard, { DashboardState } from '../Dashboard';
import { Head, usePage } from '@inertiajs/react';
import { Dialog } from '@headlessui/react';

export default function ContentPengaturanProfila({ auth }) {
    return (
        <Dashboard auth={auth}>
            <Head title="Pengaturan Profil" />
            <PengaturanProfile />
        </Dashboard>
    );
}

function PengaturanProfile() {
    const { user } = usePage().props.auth;

    const [name, setName] = useState(user.name);
    const [division, setDivision] = useState("HRD");
    const [bio, setBio] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [tempDivision, setTempDivision] = useState(division);

    const handleSubmit = () => {
        setName(tempName);
        setDivision(tempDivision);
        setIsModalOpen(false);
        console.log("Profil diperbarui:", { name: tempName, division: tempDivision, bio });
        // Kirim ke server pakai Inertia post/put jika backend sudah siap
    };

    return (
        <div className="p-8 w-full flex justify-center items-start min-h-screen bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-8">
                {/* Kartu Profil */}
                <div className="bg-white shadow-md rounded-2xl p-8">
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpQlcvIG6zkq4HlnHP0bX00SYzGexaxgUeSg&s"
                                alt="Foto Profil"
                                className="w-full h-full object-cover rounded-full border-4 border-yellow-400"
                            />
                            <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1 cursor-pointer shadow-md">
                                ✎
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-1">{name}</h2>
                        <p className="text-gray-500 text-sm text-center">{division}</p>
                    </div>

                    <div className="mt-6">
                        <textarea
                            placeholder="Tulis bio atau deskripsi singkatmu..."
                            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-yellow-400 focus:outline-none"
                            rows="4"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition duration-200"
                            >
                                Ubah Profil
                            </button>
                        </div>
                    </div>
                </div>

                {/* Email & Password */}
                <div className="bg-white shadow-md rounded-2xl p-8">
                    <h2 className="text-lg font-semibold mb-2">Email & Password</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Semua informasi di bawah hanya kamu yang bisa mengubahnya.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <div className="flex justify-between items-center border rounded-xl px-4 py-2">
                            <span>{user.email}</span>
                            <a href="#" className="text-blue-500 hover:underline text-sm font-medium">
                                Ubah Email
                            </a>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <div className="flex justify-between items-center border rounded-xl px-4 py-2">
                            <span className="text-gray-400">Belum punya password</span>
                            <a href="#" className="text-blue-500 hover:underline text-sm font-medium">
                                Tambah Password
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Ubah Profil */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
                        <Dialog.Title className="text-lg font-semibold mb-4">Ubah Profil</Dialog.Title>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama</label>
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Divisi</label>
                                <input
                                    type="text"
                                    value={tempDivision}
                                    onChange={(e) => setTempDivision(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 rounded-full bg-yellow-400 text-white font-semibold hover:bg-yellow-500"
                            >
                                Simpan
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
