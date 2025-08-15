import AuthenticatedLayout, {
    useAllState,
} from "@/Layouts/AuthenticatedLayout";
import { Head } from '@inertiajs/react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Sidebar from "./pageDashboard/Sidebar";


export default function Dashboard({children, header}) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex gap-2 text-sm items-center">
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

    // ambil state dari Allstate
    const { sidebarOpen, setSidebarOpen, buttonMenu, user } = useAllState();

    // id user
    const id = user.id;

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
            <DashboardContext.Provider value={{ setActivePage, id }}>
                <Head title="Dashboard" />

                <div className="h-full flex-1 flex">
                    {/* Sidebar */}
                    <div
                        ref={sidebar}
                        className={`bg-gray-200/30 hover-sidebar transition-all group delay-150 overflow-hidden overflow-y-auto ease-in-out duration-300 px-2 w-[60px] hover:px-4 my-scrollable-element ${
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

                    {/* Main content */}
                    <div className="w-full h-full flex-1 overflow-y-auto my-scrollable-element">
                        {children}
                    </div>
                </div>
            </DashboardContext.Provider>
        </>
    );
}
