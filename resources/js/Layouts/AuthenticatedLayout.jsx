import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Settings, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const img ="data:image/jpeg;base64,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";

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-2 px-10 bg-white">
                <div className="flex py-2">
                    <div className="flex items-center w-[400px] justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-[40px] h-[40px]">
                                {/* image perusahaan */}
                                <img
                                    src={img}
                                    alt="Image"
                                    className="h-full w-full object-cover rounded-[50%]"
                                />
                            </div>
                            {/* Nama perusahaan */}
                            <h1 className="text-xl text-gray-500">
                                PT. Maju Mundur
                            </h1>
                        </div>

                        {/* Menu icon */}
                        <div>
                            <Menu />
                        </div>
                    </div>
                    <div className="w-full flex justify-end items-center gap-5">
                        {/* Users */}
                        <div className="flex">
                            <div className="relative">
                                <div className="w-[30px] h-[30px] rounded-[50%] bg-blue-600 flex items-center justify-center text-white">
                                    <p>S</p>
                                </div>
                                <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>
                            </div>

                            <div className="relative">
                                <div className="w-[30px] h-[30px] rounded-[50%] bg-cyan-600 flex items-center justify-center text-white">
                                    <p>F</p>
                                </div>
                                <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>
                            </div>

                            <div className="relative">
                                <div className="w-[30px] h-[30px] rounded-[50%] bg-cyan-400 flex items-center justify-center text-white">
                                    <p>S</p>
                                </div>
                                <div className="w-[10px] h-[10px] bg-green-500 rounded-[50%] absolute right-0 top-[25px]"></div>
                            </div>
                        </div>

                        {/* button tambah anggota */}
                        <button className="px-4 py-2 bg-blue-400/50 rounded-lg">
                            Tambah anggota
                        </button>

                        {/* Profil icon user */}
                        <div className="w-[40px] h-[40px] rounded-[50%] bg-blue-600 flex justify-center items-center text-md text-white text-xl">
                            <p>S</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 bg-gray-600/10 w-full p-2 px-8 rounded-md flex justify-end space-x-6">
                    {/* Akses tim */}
                    <div className="flex items-center gap-1 cursor-pointer">
                        <ShieldCheck className="w-5 text-gray-500" />
                        <p className="text-sm text-gray-500">Akses tim</p>
                    </div>

                    {/* Pengaturan */}
                    <div className="flex items-center gap-1 cursor-pointer">
                        <Settings className="w-5 text-gray-500" />
                        <p className="text-sm text-gray-500">Pengaturan</p>
                    </div>
                </div>
            </div>

            <main>{children}</main>
        </div>
    );
}
