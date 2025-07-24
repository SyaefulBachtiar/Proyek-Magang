import { Head } from "@inertiajs/react";
import Dashboard from "./Dashboard";

export default function Proyek () {
    return (
        <>
            <Dashboard>
                <Head title="Proyek" />
                <h1 className="text-4xl font-bold">Halaman Proyek</h1>
            </Dashboard>
        </>
    );
}