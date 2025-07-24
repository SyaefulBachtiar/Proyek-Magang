import { useEffect } from "react";
import Dashboard, {DashboardState} from "../Dashboard";
import { Head, usePage } from "@inertiajs/react";

export default function ContentAksesTim() {
    return (
        <>
            <Dashboard>
                <Head title="Akses Tim" />    
                <AksesTim />
            </Dashboard>
        </>
    );
}

function AksesTim () {
        const { activePage } = usePage().props;
        const { setActivePage } = DashboardState();

        useEffect(() => {
            if (setActivePage && activePage) {
                setActivePage(activePage);
            }
        }, [activePage]);

        return (
            <div className="w-full h-full">
                <div className="h-full flex justify-center items-center">
                    <h1 className="text-2xl">Content Akses Tim</h1>
                </div>
            </div>
        );
}