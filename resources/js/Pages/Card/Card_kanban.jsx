import { useEffect, useRef } from "react";
import Proyek from "../Proyek";
import { X } from "lucide-react";
import { usePage } from "@inertiajs/react";

export default function Card_kanban ({cardTitle}) {

    // user
    const user = usePage().props.auth.user;

    // ref lihat card
    const lihatCardRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if(lihatCardRef.current && !lihatCardRef.current.contains(e.target)){
                window.history.back();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    })

    return (
        <Proyek>
            <div className="w-screen h-screen fixed top-0 left-0 bg-black/20 flex justify-center items-center">
                <div
                    ref={lihatCardRef}
                    className="rounded-xl p-4 bg-white w-[80%]"
                >
                    <div className="flex justify-end">
                        <div
                            className="p-2 hover:bg-black/20 rounded-md cursor-pointer"
                            // close
                            onClick={() => window.history.back()}
                        >
                            <X />
                        </div>
                    </div>

                    {/* content */}
                    <div className="">
                        {/* judul */}
                        <div className="pb-2 border-b-2 border-b-gray-200">
                            <h1 className="font-bold text-xl">{cardTitle}</h1>
                        </div>
                        {/* user */}
                        <div className="mt-10 flex gap-2 items-center">
                            {/* Avatar */}
                            <div
                                className={`w-[40px] h-[40px] rounded-[50%] bg-blue-600 cursor-pointer flex items-center justify-center text-white`}
                            >
                                <p>{user.name.charAt(0)}</p>
                            </div>

                            {/* nama */}
                            <div>
                                <p className="font-bold text-lg">{user.name}</p>
                                <p className="p-1 bg-gray-200 rounded-md text-sm">2 jam yang lalu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}