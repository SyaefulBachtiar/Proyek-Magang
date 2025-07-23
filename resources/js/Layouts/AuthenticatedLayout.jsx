
import { Link, usePage } from '@inertiajs/react';

import { Menu, Search, Settings, ShieldCheck } from 'lucide-react';
import { useState, useEffect,  createContext, useContext, useRef } from "react";


import SearchModal from '../modal/SearchModal';
import TambahAnggotaModal from '@/modal/TambahAnggotaModal';

// untuk sidebar
export const SidebarContext = createContext();

export const useAllState = () => useContext(SidebarContext);

export default function AuthenticatedLayout({ children }) {
    // users dari db
    const user = usePage().props.auth.user;

    // sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // sidebar ref
    const buttonMenu = useRef(null);

    // search/cari state
    const [search, setSearch] = useState(false);

    // Tambah Anggota
    const [tambahAnggotaModal, setTambahAnggotaModal] = useState(false);

    // Users
    const users = [
        {
            nama: "Syaeful",
            role: "Super User",
            jabatan: "Manager",
            color: "bg-blue-700",
        },
        {
            nama: "Sahrul",
            role: "Admin",
            jabatan: "Manager",
            color: "bg-cyan-700",
        },
        {
            nama: "Fikri",
            role: "Admin",
            jabatan: "Manager",
            color: "bg-green-900",
        },
    ];


    const img ="";
    console.log("Modal: ", search);

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    return (
        <SidebarContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                search,
                setSearch,
                buttonMenu,
            }}
        >
            <div className="h-screen flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-2 px-4 bg-gray-200/30">
                    <div className="flex py-2 gap-5">
                        <div className="flex items-center w-[500px] justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-[40px] h-[40px]">
                                    {/* image perusahaan */}
                                    <img
                                        src="/img/kemenkes.png"
                                        alt="Image"
                                        className="h-full w-full object-cover rounded-[50%]"
                                    />
                                </div>
                                {/* Nama perusahaan */}
                                <h1 className="text-xl text-gray-500">
                                    Kemenkes
                                </h1>
                            </div>

                            {/* Menu icon */}
                            <div>
                                <Menu
                                    ref={buttonMenu}
                                    onClick={() =>
                                        setSidebarOpen((prev) => !prev)
                                    }
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="w-[250px] flex items-center ">
                            <div
                                className="group flex items-center gap-4 h-[30px] justify-start mx-4 border border-gray-400 p-[7px] rounded-xl w-[35px] overflow-hidden transition-all duration-500 hover:w-full cursor-pointer"
                                onClick={() => setSearch(true)}
                            >
                                <Search className="text-gray-400 min-w-5 h-5 group-hover:text-black" />
                                <p className="text-gray-400 group-hover:text-black">
                                    Cari..
                                </p>
                            </div>
                        </div>

                        <div className="w-full flex justify-end items-center gap-5">
                            {/* Users */}
                            <div className="flex">
                                {users.map((user, i) => (
                                    <div
                                        key={i}
                                        className="relative group mx-1"
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`w-[30px] h-[30px] rounded-[50%] ${user.color} cursor-pointer flex items-center justify-center text-white`}
                                        >
                                            <p>{user.nama.charAt(0)}</p>
                                        </div>

                                        {/* Status bulat hijau */}
                                        <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>

                                        {/* Hover modal/info box */}
                                        <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-10 w-max px-3 py-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <p className="text-sm font-semibold">
                                                {user.nama}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {user.jabatan}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {user.role}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* button tambah anggota */}
                            <button
                                className="px-4 py-2 bg-blue-400/50 rounded-lg"
                                onClick={() => setTambahAnggotaModal(true)}
                            >
                                Tambah anggota
                            </button>

                            {/* Profil icon user */}
                            <div className="w-[40px] h-[40px] rounded-[50%] bg-blue-600 flex justify-center items-center text-md text-white text-xl">
                                <p>S</p>
                            </div>
                        </div>
                    </div>


                    <div className="bg-gray-600/10 w-full p-2 px-8 rounded-md flex justify-end space-x-6" ref={dropdownRef}>

                    {/* <div className="bg-gray-600/10 w-full p-2 px-8 rounded-md flex justify-end space-x-6"> */}

                        {/* Akses tim */}
                        {/* <div className="flex items-center gap-1 cursor-pointer">
                            <ShieldCheck className="w-5 text-gray-500" />
                            <p className="text-sm text-gray-500">Akses tim</p>
                        </div> */}

                        {/* Pengaturan */}

                </div>

                        {/* {/* <div className="flex items-center gap-1 cursor-pointer"> */}
                            {/* <Settings className="w-5 text-gray-500" />
                            <p className="text-sm text-gray-500">Pengaturan</p>
                        </div> */}
                    {/* </div> */}
                </div> 


                <main className="flex-1 h-full flex flex-col overflow-hidden">
                    {children}
                </main>

                {/* modal search */}
                {search && <SearchModal onClose={() => setSearch(false)} />}

                {/* Modal Tambah Anggota */}
                {tambahAnggotaModal && (
                    <TambahAnggotaModal
                        onclick={() => setTambahAnggotaModal(false)}
                    />
                )}
            </div>
        </SidebarContext.Provider>
    );
}
