import { useAllState } from "@/Layouts/AuthenticatedLayout";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";



export default function SearchModal() {

    // search state dari AllState
    const {setSearch} = useAllState();

    const searchModal = useRef(null);

    useEffect(() => {
        function handleClickOutside(e){
            if(searchModal.current && !searchModal.current.contains(e.target)){
                setSearch(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div ref={searchModal} className="bg-white rounded-lg p-6 shadow-lg w-3/4 h-3/4 relative">
                <button
                    onClick={() => setSearch(false)}
                    className="absolute top-2 right-2 hover:text-black"
                >
                    <X />
                </button>
                <h2 className="text-lg font-semibold mb-2">Cari Sesuatu</h2>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                    placeholder="Ketik sesuatu..."
                />
            </div>
        </div>
    );
}
