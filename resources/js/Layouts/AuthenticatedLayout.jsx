
import { Link, router, usePage } from '@inertiajs/react';

import { Bell, LogOut, Menu, Search, Settings, ShieldCheck, UserRoundPlus } from 'lucide-react';
import { useState, useEffect,  createContext, useContext, useRef } from "react";


import SearchModal from '../modal/SearchModal';
import TambahAnggotaModal from '@/modal/TambahAnggotaModal';
import Notif from '@/modal/Notifikasi/Notif';


// untuk sidebar
export const SidebarContext = createContext();

export const useAllState = () => useContext(SidebarContext);

export default function AuthenticatedLayout({ children, header }) {
    // users dari db
    const user = usePage().props.auth.user;

    const { perusahaan, timLayout, role, notifikasi } = usePage().props;
    
    // notif state
    const [notif, setNotif] = useState(false);

    // sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // sidebar ref
    const buttonMenu = useRef(null);

    // search/cari state
    const [search, setSearch] = useState(false);

    // Tambah Anggota
    const [tambahAnggotaModal, setTambahAnggotaModal] = useState(false);

    // profil dropdown
    const [profileDown, setProfileDown] = useState(false);

    const onlineUsers = timLayout.filter((member) => member.is_online);
    const offlineUsers = timLayout.filter((member) => !member.is_online);

    // profil dropdown ref
    const profileDropDownRef = useRef(null);

    useEffect(() => {
        if(user.id){
            // console.log(`Subscribing to private channel: board.${user.id}`)
            const channel = window.Echo.private(`user.${user.id}`);

            channel.listen(".notif.updated", (event) => {
                console.log("Real-time event received:", event);
                router.reload({
                    only: ["notifikasi"],
                });
            });

            return () => {
                // console.log(`Leaving channel: board.${user.id}`);
                window.Echo.leave(`user.${user.id}`);
            };
        }
    }, [user.id]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileDropDownRef.current &&
                !profileDropDownRef.current.contains(event.target)
            ) {
                setProfileDown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <SidebarContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                search,
                setSearch,
                buttonMenu,
                user,
            }}
        >
            <div className="h-screen flex flex-col overflow-hidden">
                {/* Header */}
                <div className="py-1 px-3 bg-white relative">
                    <div className="flex py-2 gap-5">
                        <div className="flex items-center w-[500px] justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-[40px] h-[40px]">
                                    {/* image perusahaan */}
                                    <img
                                        src="/img/kemenkes.png"
                                        alt="Image"
                                        className="h-full w-full object-cover rounded-[50%]"
                                    />
                                </div>
                                {/* Nama perusahaan */}
                                <h1 className="text-sm font-semibold sm:text-sm md:text-sm lg:text-lg xl:text-2xl uppercase">
                                    {perusahaan || "Belum ada nama perusahaan"}
                                </h1>
                            </div>

                            {/* Menu icon */}
                            <div>
                                <Menu
                                    size={30}
                                    ref={buttonMenu}
                                    onClick={() =>
                                        setSidebarOpen((prev) => !prev)
                                    }
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="w-full justify-end items-center hidden mr-5 gap-8 sm:flex md:flex lg:flex xl:flex">
                            {/* Users */}
                            <div className="flex">
                                {onlineUsers
                                    ? onlineUsers.map((users, i) => (
                                          <div
                                              key={i}
                                              className="relative group mx-1"
                                          >
                                              {/* Avatar */}

                                              {users.poto_profile_user ? (
                                                  <div
                                                      className={`w-[30px] h-[30px] rounded-[50%] cursor-pointer flex items-center justify-center overflow-hidden`}
                                                  >
                                                      <img
                                                          src={`/storage/${users.poto_profile_user}`}
                                                          alt="Foto Profil"
                                                          className="object-cover h-full"
                                                      />
                                                  </div>
                                              ) : (
                                                  <div
                                                      className={`w-[30px] h-[30px] rounded-[50%] bg-cyan-400 cursor-pointer flex items-center justify-center text-white`}
                                                  >
                                                      <p>
                                                          {users.name.charAt(0)}
                                                      </p>
                                                  </div>
                                              )}

                                              {/* Status bulat hijau */}
                                              <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>

                                              {/* Hover modal/info box */}
                                              <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-10 w-max px-3 py-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                  <p className="text-sm font-semibold">
                                                      {users.name === user.name
                                                          ? "Anda"
                                                          : users.name}
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                      {users.jabatan}
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                      {users.role}
                                                  </p>
                                              </div>
                                          </div>
                                      ))
                                    : offlineUsers.map((users, i) => (
                                          <div
                                              key={i}
                                              className="relative group mx-1"
                                          >
                                              {/* Avatar */}

                                              {users.poto_profile_user ? (
                                                  <div
                                                      className={`w-[30px] h-[30px] rounded-[50%] cursor-pointer flex items-center justify-center overflow-hidden`}
                                                  >
                                                      <img
                                                          src={`/storage/${users.poto_profile_user}`}
                                                          alt="Foto Profil"
                                                          className="object-cover h-full"
                                                      />
                                                  </div>
                                              ) : (
                                                  <div
                                                      className={`w-[30px] h-[30px] rounded-[50%] bg-cyan-400 cursor-pointer flex items-center justify-center text-white`}
                                                  >
                                                      <p>
                                                          {users.name.charAt(0)}
                                                      </p>
                                                  </div>
                                              )}

                                              {/* Status bulat hijau */}
                                              <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>

                                              {/* Hover modal/info box */}
                                              <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-10 w-max px-3 py-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                  <p className="text-sm font-semibold">
                                                      {users.name === user.name
                                                          ? "Anda"
                                                          : users.name}
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                      {users.jabatan}
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                      {users.role}
                                                  </p>
                                              </div>
                                          </div>
                                      ))}
                            </div>

                            <div
                                onClick={() => setNotif(!notif)}
                                className="p-2 bg-[#F0E460] rounded-lg text-white cursor-pointer relative"
                            >
                                    {notifikasi.unread_count > 0 ? (
                                        <div className="absolute -top-2 -right-2 p-1 bg-blue-600 h-[20px] w-[20px] rounded-full flex items-center justify-center text-xs">
                                                <span>{notifikasi.unread_count}</span>
                                        </div>
                                    ) : ""}
                                <Bell size={20} />
                            </div>

                            {notif && (
                                <Notif
                                    close={() => setNotif(false)}
                                    notifData={notifikasi}
                                />
                            )}

                            {/* button tambah anggota */}
                            {role !== "Super User" || role !== "Admin" ? (
                                <button
                                    className="p-2 bg-[#0076FD] rounded-lg flex items-center text-white gap-2"
                                    onClick={() => setTambahAnggotaModal(true)}
                                >
                                    <UserRoundPlus size={20} />
                                    <p className="text-xs sm:text-[15px]">
                                        Tambah anggota
                                    </p>
                                </button>
                            ) : (
                                ""
                            )}

                            {/* Profil icon user */}
                            <div ref={profileDropDownRef} className="relative">
                                {user.poto_profile_user ? (
                                    <div
                                        onClick={() =>
                                            setProfileDown((prev) => !prev)
                                        }
                                        className="w-[50px] h-[50px] rounded-[50%] flex justify-center items-center text-md text-white text-xl overflow-hidden cursor-pointer"
                                    >
                                        <img
                                            src={`/storage/${user.poto_profile_user}`}
                                            alt="profile"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() =>
                                            setProfileDown((prev) => !prev)
                                        }
                                        className="w-[40px] h-[40px] rounded-[50%] flex bg-blue-500 justify-center items-center text-md text-white text-xl overflow-hidden cursor-pointer"
                                    >
                                        <p>{user?.name?.charAt(0)}</p>
                                    </div>
                                )}

                                {/* dropdown Profil */}
                                <div
                                    className={`absolute z-50 right-1 top-14 ${
                                        profileDown ? "flex" : "hidden"
                                    }`}
                                >
                                    <ul className="p-2 bg-white flex flex-col gap-2 shadow-lg rounded-md">
                                        <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md">
                                            <Link
                                                href={route("profile.edit", {
                                                    id: user.id,
                                                })}
                                                className="text-sm text-gray-400 text-left flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                                Pengaturan
                                            </Link>
                                        </li>

                                        <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md">
                                            <LogOut className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="text-sm text-gray-400 text-left"
                                            >
                                                Log out
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {header && <header className="w-full">{header}</header>}
                </div>

                <main className="flex-1 h-full flex flex-col overflow-hidden">
                    {children}
                </main>

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
