import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function TambahAnggotaModal({onclick}) {
    // reff modal Outside
    const modalOutside = useRef(null);
    useEffect(() => {
        function handleClickOutside (e) {
            if (modalOutside.current && !modalOutside.current.contains(e.target)) {
                onclick()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return ()=> {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    },[])

        return (
        <>
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div 
                ref={modalOutside}
                    className="bg-white rounded-lg p-6 px-10 shadow-lg w-[500px] h-3/4"
                >
                    <div className="flex justify-end">
                        <X onClick={onclick} className="cursor-pointer" />
                    </div>
                    <div>
                        <div className="my-5">
                            <h1 className="text-4xl">Buat Tim</h1>
                        </div>
                        <form className="my-5">

                            
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}