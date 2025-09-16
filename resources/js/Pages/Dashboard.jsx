import AuthenticatedLayout, {
    useAllState,
} from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from '@inertiajs/react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Sidebar from "./pageDashboard/Sidebar";


export default function Dashboard({children, header}) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex gap-2 text-sm items-center w-full">
                    {header}
                </div>
            }
        >
            <DashboardContent>{children}</DashboardContent>
        </AuthenticatedLayout>
    );
}



// untuk state dashboard
export const DashboardContext = createContext();

export const DashboardState = () => useContext(DashboardContext);



function DashboardContent({children}){
    // sidebar ref
    const sidebar = useRef(null);

    // flash
    const { flash } = usePage().props;

    // flash state
    const [showFlashSuccess, setShowFlashSuccess] = useState(false);
    const [showFlashError, setShowFlashError] = useState(false);

    // timer helper
    const showFlash = (setter, delay = 2000) => {
        setter(true);

        setTimeout(() => {
            setter(false); // matikan flash setelah delay
        }, delay);
    };

    const [localFlash, setLocalFlash] = useState({
        success: null,
        error: null,
    });

    // copy flash ke state lokal sekali setiap ada update
    useEffect(() => {
        if (flash.success || flash.error) {
            setLocalFlash(flash);
        }
    }, [flash]);

    // handle flash dari state lokal
    useEffect(() => {
        if (localFlash.success) {
            showFlash(setShowFlashSuccess);
            setLocalFlash((prev) => ({ ...prev, success: null })); // reset
        } else if (localFlash.error) {
            showFlash(setShowFlashError);
            setLocalFlash((prev) => ({ ...prev, error: null })); // reset
        }
    }, [localFlash]);

    // ambil state dari Allstate
    const { sidebarOpen, setSidebarOpen, buttonMenu, user } = useAllState();

    // id user
    const id = user.id;

    // active page
    const [activePage, setActivePage] = useState("DashboardMain");

    // tutup sidebar ketika klik selain sidebar
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                sidebar.current &&
                !sidebar.current.contains(e.target) &&
                buttonMenu.current &&
                !buttonMenu.current.contains(e.target)
            ) {
                setSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <DashboardContext.Provider value={{ setActivePage, id }}>
                <Head title="Dashboard" />

                <div className="h-full flex-1 flex">
                    {/* Sidebar */}
                    <div
                        ref={sidebar}
                        className={`bg-white hover-sidebar transition-all group delay-150 overflow-hidden overflow-y-auto ease-in-out duration-300 px-[13px] w-[70px] hover:px-4 my-scrollable-element ${
                            sidebarOpen ? "sidebar-click px-4" : ""
                        }`}
                    >
                        <Sidebar
                            sidebarOpen={sidebarOpen}
                            activePage={activePage}
                            setActivePage={setActivePage}
                            id={id}
                        />
                    </div>
                    {/* flash alert */}
                    <div
                        className={`
                                fixed bottom-16 right-10 z-50 min-w-[100px] rounded-md p-4 
                                border border-gray-100 cursor-pointer
                                transform transition-transform duration-500 ease-in-out
                                ${
                                    showFlashSuccess || showFlashError
                                        ? "translate-x-0 opacity-100"
                                        : "translate-x-full opacity-0"
                                }
                                ${
                                    showFlashSuccess
                                        ? "text-white bg-blue-600"
                                        : showFlashError
                                        ? "text-white bg-red-600"
                                        : ""
                                }
                            `}
                    >
                        <p>{flash.success || flash.error}</p>
                    </div>

                    {/* Main content */}
                    <div className="w-full h-full flex-1 overflow-y-auto my-scrollable-element bg-[#F4F4F4] rounded-tl-2xl">
                        {children}
                    </div>
                </div>
            </DashboardContext.Provider>
        </>
    );
}
