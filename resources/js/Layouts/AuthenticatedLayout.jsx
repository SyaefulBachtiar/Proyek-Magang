import { Link, router, usePage } from "@inertiajs/react";

import {
    Bell,
    LogOut,
    Menu,
    Search,
    Settings,
    ShieldCheck,
    UserRoundPlus,
    Plus,
} from "lucide-react";
import { useState, useEffect, createContext, useContext, useRef } from "react";

import SearchModal from "../modal/SearchModal";
import TambahAnggotaModal from "@/modal/TambahAnggotaModal";
import Notif from "@/modal/Notifikasi/Notif";

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

    // format waktu
      const formatRelativeTime = (isoDate) => {
          const date = new Date(isoDate);
          const now = new Date();
          const seconds = Math.round((now - date) / 1000);
          const minutes = Math.round(seconds / 60);
          const hours = Math.round(minutes / 60);
          const days = Math.round(hours / 24);

          if (seconds < 60) return `${seconds} detik yang lalu`;
          if (minutes < 60) return `${minutes} menit yang lalu`;
          if (hours < 24) return `${hours} jam yang lalu`;
          return `${days} hari yang lalu`;
      };

    // profil dropdown
    const [profileDown, setProfileDown] = useState(false);

    const onlineUsers = timLayout.filter((member) => member.is_online);
    const offlineUsers = timLayout.filter((member) => !member.is_online);

    // Limit online users display to 5
    const displayedOnlineUsers = onlineUsers.slice(0, 5);
    const remainingOnlineUsers = onlineUsers.length - 5;

    const displayedOfflineUsers = offlineUsers.slice(0, 2);
    const remainingOfflineUsers = offlineUsers.length - 2;

    // profil dropdown ref
    const profileDropDownRef = useRef(null);

    useEffect(() => {
        if (!user.id) return;
        // console.log(`Subscribing to private channel: board.${user.id}`)
        const channel = window.Echo.private(`user.${user.id}`);

        channel.listen(".notif.updated", (event) => {
            console.log("Real-time event received:", event);
            router.reload({
                only: ["notifikasi", "timLayout"],
                preserveState: true,
                preserveScroll: true,
            });
        });

        return () => {
            // console.log(`Leaving channel: board.${user.id}`);
            window.Echo.leave(`user.${user.id}`);
        };
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

                            <div className="flex gap-5 items-center">
                                <div className="flex items-center">
                                    {/* Tampilkan maksimal 5 user online */}
                                    {displayedOnlineUsers.map((users, i) => (
                                        <div
                                            key={i}
                                            className="relative group -mr-2"
                                        >
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

                                            <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>

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
                                                <p className="text-xs text-green-400">
                                                    {user.is_online ??
                                                        "online"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Tampilkan icon + jika ada lebih dari 5 user online */}
                                    {remainingOnlineUsers > 0 && (
                                        <div className="relative group">
                                            <div className="w-[30px] h-[30px] rounded-[50%] bg-gray-500 cursor-pointer flex items-center justify-center text-white">
                                                <span className="text-xs font-semibold">
                                                    +{remainingOnlineUsers}
                                                </span>
                                            </div>

                                            <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>

                                            <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-10 w-max px-3 py-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <p className="text-sm font-semibold">
                                                    {remainingOnlineUsers} user
                                                    lainnya online
                                                </p>
                                                <div className="mt-2 max-h-32 overflow-y-auto">
                                                    {onlineUsers
                                                        .slice(5)
                                                        .map((users, i) => (
                                                            <div
                                                                key={i}
                                                                className="text-xs text-gray-600 py-1"
                                                            >
                                                                {users.name ===
                                                                user.name
                                                                    ? "Anda"
                                                                    : users.name}{" "}
                                                                -{" "}
                                                                {users.jabatan}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    {/* Tampilkan maksimal 5 user offline */}
                                    {displayedOfflineUsers.map((users, i) => (
                                        <div
                                            key={i}
                                            className="relative group -mr-2"
                                        >
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

                                            <div className="w-[10px] h-[10px] bg-gray-400 rounded-[50%] absolute right-0 top-[25px]"></div>

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
                                                <p className="text-xs text-gray-400">
                                                    {!users.is_online &&
                                                        "offline"} {" "}
                                                        {formatRelativeTime(users.last_seen)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Tampilkan icon + jika ada lebih dari 5 user offline */}
                                    {remainingOfflineUsers > 0 && (
                                        <div className="relative group">
                                            <div className="w-[30px] h-[30px] rounded-[50%] bg-gray-600 cursor-pointer flex items-center justify-center text-white">
                                                <span className="text-xs font-semibold">
                                                    +{remainingOfflineUsers}
                                                </span>
                                            </div>

                                            <div className="w-[10px] h-[10px] bg-gray-400 rounded-[50%] absolute right-0 top-[25px]"></div>

                                            <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-10 w-max px-3 py-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <p className="text-sm font-semibold">
                                                    {remainingOfflineUsers} user
                                                    lainnya offline
                                                </p>
                                                <div className="mt-2 max-h-32 overflow-y-auto">
                                                    {offlineUsers
                                                        .slice(5)
                                                        .map((users, i) => (
                                                            <div
                                                                key={i}
                                                                className="text-xs text-gray-600 py-1"
                                                            >
                                                                {users.name ===
                                                                user.name
                                                                    ? "Anda"
                                                                    : users.name}{" "}
                                                                -{" "}
                                                                {users.jabatan}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                onClick={() => setNotif(!notif)}
                                className="p-2 bg-[#F0E460] rounded-lg text-white cursor-pointer relative"
                            >
                                {notifikasi.unread_count > 0 ? (
                                    <div className="absolute -top-2 -right-2 p-1 bg-blue-600 h-[20px] w-[20px] rounded-full flex items-center justify-center text-xs">
                                        <span>{notifikasi.unread_count}</span>
                                    </div>
                                ) : (
                                    ""
                                )}
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
