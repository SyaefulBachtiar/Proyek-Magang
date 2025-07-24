import { usePage } from "@inertiajs/react";
import Dashboard, {DashboardState} from "../Dashboard";
import { useEffect } from "react";

export default function ContentPengaturan () {
    return (
        <Dashboard>
            <Pengaturan />
        </Dashboard>
    );
}

function Pengaturan () {

    // Props dari controller
    const { activePage } = usePage().props;

    // Dashboard state
    const { setActivePage } = DashboardState();

    useEffect(() => {
        if(activePage && setActivePage){
            setActivePage(activePage);
        }
    }, [activePage]);

    return(
        <div className="w-full h-full">
            <div className="h-full flex justify-center items-center">
                <h1 className="text-2xl">Content Pengaturan</h1>
            </div>
        </div>
    )
}