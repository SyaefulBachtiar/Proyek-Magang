import AuthenticatedLayout, {
    useAllState,
} from "@/Layouts/AuthenticatedLayout";
import { Head } from '@inertiajs/react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Sidebar from "./pageDashboard/Sidebar";
import ContentMainDashboard from "./pageDashboard/ContentMainDashboard";
import ContentAksesTim from "./pageDashboard/ContentAksesTim";
import ContentPengaturan from "./pageDashboard/ContentPengaturan";

export default function Dashboard({children}) {
    return (
        <AuthenticatedLayout>
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

    // ambil state dari Allstate
    const { sidebarOpen, setSidebarOpen, buttonMenu } = useAllState();

    // active page
    const [activePage, setActivePage] = useState("DashboardMain");

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
    }, []);



    return (
        <>
        <DashboardContext.Provider value={{ setActivePage }}>
            <Head title="Dashboard" />

            <div className="h-full flex-1 flex">
                {/* Sidebar */}
                <div
                    ref={sidebar}
                    className={`bg-gray-200/30 hover-sidebar transition-all delay-150 overflow-hidden ease-in-out duration-300 px-2 hover:px-4 ${
                        sidebarOpen ? "sidebar-click px-4" : ""
                    }`}
                >
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        activePage={activePage}
                        setActivePage={setActivePage}
                    />
                </div>

                {/* Main content */}
                <div className="w-full h-full flex-1 px-4 overflow-y-scroll">
                    {children}
                </div>
            </div>
            </DashboardContext.Provider>
        </>
    );
}
