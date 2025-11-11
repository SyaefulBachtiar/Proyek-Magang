import { Link, router, usePage } from "@inertiajs/react";
import { Bell, LogOut, Menu, Settings, UserRoundPlus } from "lucide-react";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import TambahAnggotaModal from "@/modal/TambahAnggotaModal";
import Notif from "@/modal/Notifikasi/Notif";

export const SidebarContext = createContext();

export const useAllState = () => useContext(SidebarContext);

export default function AuthenticatedLayout({ children, header }) {
    const user = usePage().props.auth.user;

    const { perusahaan, timLayout, role, notifikasi, perusahaan_id } =
        usePage().props;

    const [notif, setNotif] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const buttonMenu = useRef(null);

    const [search, setSearch] = useState(false);

    const [tambahAnggotaModal, setTambahAnggotaModal] = useState(false);

    const [onlineUsersList, setOnlineUsersList] = useState([]);

    const [showRemainingOnline, setShowRemainingOnline] = useState(false);
    const remainingOnlineRef = useRef(null);
    const remainingOnlineTriggerRef = useRef(null);

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

    const [profileDown, setProfileDown] = useState(false);

    const onlineUsers = onlineUsersList;
    const onlineUserIds = new Set(onlineUsersList.map((u) => u.id));
    const offlineUsers = timLayout.filter(
        (member) => !onlineUserIds.has(member.id)
    );
    const displayedOnlineUsers = onlineUsers.slice(0, 5);
    const remainingOnlineUsers = onlineUsers.length - 5;

    const displayedOfflineUsers = offlineUsers.slice(0, 2);
    const remainingOfflineUsers = offlineUsers.length - 2;

    const profileDropDownRef = useRef(null);

    useEffect(() => {
        if (!perusahaan_id) return;

        window.Echo.join(`company.presence.${perusahaan_id}`)
            .here((users) => {
                setOnlineUsersList(users);
            })
            .joining((user) => {
                setOnlineUsersList((prevUsers) => [...prevUsers, user]);
            })
            .leaving((user) => {
                setOnlineUsersList((prevUsers) =>
                    prevUsers.filter((u) => u.id !== user.id)
                );
                router.reload({
                    only: ["timLayout"],
                    preserveState: true,
                    preserveScroll: true,
                });
            })
            .error((error) => {
                console.error("Echo subscription error:", error);
            });

        return () => {
            window.Echo.leave(`company.presence.${perusahaan_id}`);
        };
    }, [perusahaan_id]);

    useEffect(() => {
        if (!user.id) return;
        const channel = window.Echo.private(`user.${user.id}`);

        channel.listen(".notif.updated", (event) => {
            router.reload({
                only: ["notifikasi", "timLayout"],
                preserveState: true,
                preserveScroll: true,
            });
        });

        return () => {
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
            if (
                remainingOnlineRef.current &&
                !remainingOnlineRef.current.contains(event.target) &&
                remainingOnlineTriggerRef.current &&
                !remainingOnlineTriggerRef.current.contains(event.target)
            ) {
                setShowRemainingOnline(false);
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
                <div className="py-2 px-4 bg-white relative border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center justify-between w-full sm:w-auto md:w-[320px]">
                        <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10">
                                    <img
                                        src="/img/kemenkes.png"
                                        alt="Logo Perusahaan" 
                                        className="h-full w-full object-cover rounded-full"
                                    />
                                </div>
                                <h1 className="text-base font-semibold uppercase md:text-lg leading-snug">
                                    {perusahaan || "Belum ada nama perusahaan"}
                                </h1>
                            </div>
                            <div className="flex-shrink-0">
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

                        <div className="w-full sm:w-auto flex items-center justify-end gap-2 sm:gap-3 md:gap-8">
                            {/* Users */}
                            <div className="hidden sm:flex gap-5 items-center">
                                <div className="flex items-center">
                                    {/* Tampilkan maksimal 5 user online */}
                                    {displayedOnlineUsers.map((users, i) => (
                                        <div
                                            key={i}
                                            className="relative group -mr-2"
                                        >
                                            {users.poto_profile_user ? (
                                                <div className="w-[30px] h-[30px] rounded-[50%] cursor-pointer flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`/storage/${users.poto_profile_user}`}
                                                        alt="Foto Profil"
                                                        className="object-cover h-full w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[30px] h-[30px] rounded-[50%] bg-cyan-400 cursor-pointer flex items-center justify-center text-white">
                                                    <p className="text-sm">
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
                                                    online
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {remainingOnlineUsers > 0 && (
                                        <div className="relative">
                                            <div
                                                ref={remainingOnlineTriggerRef}
                                                onClick={() =>
                                                    setShowRemainingOnline(
                                                        (prev) => !prev
                                                    )
                                                }
                                                className="w-[30px] h-[30px] rounded-[50%] bg-gray-500 cursor-pointer flex items-center justify-center text-white"
                                            >
                                                <span className="text-xs font-semibold">
                                                    +{remainingOnlineUsers}
                                                </span>
                                            </div>
                                            <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>

                                            {showRemainingOnline && (
                                                <div
                                                    ref={remainingOnlineRef}
                                                    className="absolute top-[40px] left-1/2 -translate-x-1/2 z-50 w-60 bg-white border rounded-lg shadow-xl"
                                                >
                                                    <div className="p-3 border-b">
                                                        <p className="text-sm font-semibold">
                                                            Anggota Online
                                                        </p>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto p-2 space-y-2">
                                                        {onlineUsers
                                                            .slice(5)
                                                            .map((u, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    {u.poto_profile_user ? (
                                                                        <div className="w-6 h-6 rounded-full overflow-hidden">
                                                                            <img
                                                                                src={`/storage/${u.poto_profile_user}`}
                                                                                alt={u.name}
                                                                                className="object-cover h-full w-full"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-white text-xs">
                                                                            {u.name.charAt(
                                                                                0
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    <span className="text-xs text-gray-700">
                                                                        {u.name}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:flex items-center">
                                    {displayedOfflineUsers.map((users, i) => (
                                        <div
                                            key={i}
                                            className="relative group -mr-2"
                                        >
                                            {users.poto_profile_user ? (
                                                <div className="w-[30px] h-[30px] rounded-[50%] cursor-pointer flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`/storage/${users.poto_profile_user}`}
                                                        alt="Foto Profil"
                                                        className="object-cover h-full w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[30px] h-[30px] rounded-[50%] bg-cyan-400 cursor-pointer flex items-center justify-center text-white">
                                                    <p className="text-sm">
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
                                                    offline{" "}
                                                    {formatRelativeTime(
                                                        users.last_seen
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

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
                                                        .slice(2)
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
                                className="p-2 bg-[#F0E460] rounded-lg text-white cursor-pointer relative flex-shrink-0"
                            >
                                {notifikasi.unread_count > 0 ? (
                                    <div className="absolute -top-1 -right-1 p-1 bg-blue-600 h-5 w-5 rounded-full flex items-center justify-center text-xs">
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

                            {(role === "Super User" || role === "Admin") && (
                                <button
                                    className="p-2 bg-[#0076FD] rounded-lg flex items-center text-white gap-2 flex-shrink-0"
                                    onClick={() => setTambahAnggotaModal(true)}
                                >
                                    <UserRoundPlus size={20} />
                                    <p className="text-xs sm:text-[15px] hidden sm:block">
                                        Tambah anggota
                                    </p>
                                </button>
                            )}

                            <div
                                ref={profileDropDownRef}
                                className="relative flex-shrink-0"
                            >
                                {user.poto_profile_user ? (
                                    <div
                                        onClick={() =>
                                            setProfileDown((prev) => !prev)
                                        }
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center overflow-hidden cursor-pointer"
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
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex bg-blue-500 justify-center items-center text-md text-white overflow-hidden cursor-pointer"
                                    >
                                        <p className="text-sm sm:text-xl">
                                            {user?.name?.charAt(0)}
                                        </p>
                                    </div>
                                )}

                                <div
                                    className={`absolute z-50 right-1 top-12 sm:top-14 ${
                                        profileDown ? "flex" : "hidden"
                                    }`}
                                >
                                    <ul className="p-2 bg-white flex flex-col gap-2 shadow-lg rounded-md w-max">
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

                    {header && (
                        <header className="w-full mt-2 px-4 sm:px-0">
                            {header}
                        </header>
                    )}
                </div>

                <main className="flex-1 h-full flex flex-col overflow-hidden">
                    {children}
                </main>

                {tambahAnggotaModal && (
                    <TambahAnggotaModal
                        onclick={() => setTambahAnggotaModal(false)}
                    />
                )}
            </div>
        </SidebarContext.Provider>
    );
}