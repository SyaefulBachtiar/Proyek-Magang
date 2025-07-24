import { useEffect } from "react";
import Dashboard, {DashboardState} from "../Dashboard";
import { usePage } from "@inertiajs/react";

export default function ContentAksesTim() {
    return (
        <>
            <Dashboard>
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