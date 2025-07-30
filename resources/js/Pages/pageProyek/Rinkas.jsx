import Proyek from "../Proyek"

export default function Ringkas({ dashboardId, activePage }) {
    return (
        <Proyek dashboardId={dashboardId} activePage={activePage}>
            <div className="rounded-lg h-full bg-slate-300 flex justify-center items-center">
                <div className="flex w-[800px] h-[400px] gap-5 flex-wrap">
                    <div className="w-64 h-48 flex-none bg-white rounded-md">
                        Menu 1
                    </div>
                    <div className="w-64 h-48 flex-1 bg-white rounded-md">
                        Menu 2
                    </div>
                    <div className="w-64 h-48 flex-none bg-white rounded-md">
                        Menu 3
                    </div>
                    <div className="w-64 h-48 flex-none bg-white rounded-md">
                        Menu 4
                    </div>
                    <div className="w-64 h-48 flex-1 bg-white rounded-md">
                        Menu 5
                    </div>
                    <div className="w-64 h-48 flex-none bg-white rounded-md">
                        Menu 6
                    </div>
                </div>
            </div>
        </Proyek>
    );
}