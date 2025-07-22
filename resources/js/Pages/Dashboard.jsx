import AuthenticatedLayout, {
    useAllState,
} from "@/Layouts/AuthenticatedLayout";
import { Head } from '@inertiajs/react';
import { ListFilterIcon, PlusCircle, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <DashboardContent/>
        </AuthenticatedLayout>
    );
}

function DashboardContent(){
    const sidebar = useRef(null);
    const { sidebarOpen, setSidebarOpen, buttonMenu } = useAllState();



    // tutup sidebar ketika klik selain sidebar
    useEffect(() => {
        function handleClickOutside(e){
            if(sidebar.current && !sidebar.current.contains(e.target) && buttonMenu.current && !buttonMenu.current.contains(e.target)){
                setSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [])
    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen flex">
                {/* Sidebar */}
                <div
                    ref={sidebar}
                    className={`bg-gray-200/30 hover-sidebar group transition-all delay-150 overflow-hidden ease-in-out duration-300 px-2 hover:px-4 ${
                        sidebarOpen ? "sidebar-click px-4" : ""
                    }`}
                >
                    <div className="w-full flex justify-end my-10 py-2 rounded-lg ">
                        <div className="w-full flex overflow-hidden gap-4 relative items-center">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                className={`pr-4 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:ring-gray-400 transition-all delay-150 ease-in-out duration-300 group-hover:pl-10 group-hover:w-full ${
                                    sidebarOpen ? "w-full pl-10" : "w-0 pl-6"
                                }`}
                                placeholder="Cari..."
                            />
                            <div className='p-2 bg-white rounded-lg'>
                                <ListFilterIcon className='w-5 h-5'/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full flex-1 px-4">
                    <div className="flex flex-col justify-center items-center px-5">
                        {/* buat grup */}
                        <div className="my-10 flex flex-col justify-center items-center gap-2">
                            <h1 className="text-xl text-gray-400">Buat grup</h1>
                            <PlusCircle className="w-10 h-10 text-gray-400" />
                        </div>

                        {/* card grup */}
                        <div className="w-full">
                            {/* <div className="w-64 h-44 bg-gray-400"></div> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
