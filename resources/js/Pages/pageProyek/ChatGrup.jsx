import Proyek from "../Proyek";

export default function ChatGrup ({dashboardId, activePage}) {
    return (
        <Proyek dashboardId={dashboardId} activePage={activePage}>
            <div className="w-full bg-slate-300">
                <div className="text-2xl flex justify-center items-center">
                    <h1>Halaman Chat grup</h1>
                </div>
            </div>
        </Proyek>
    );
}