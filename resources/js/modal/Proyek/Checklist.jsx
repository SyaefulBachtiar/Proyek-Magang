import InputSelect from "@/Components/InputSelect";
import { X } from "lucide-react";
import { useRef, useState } from "react";

export default function Checklist ({ close, card_id, refTrigger }) {
    const modalRef = useRef(null);

    useState(() => {
        function handleClickOutside(event) {
            if(modalRef.current && !modalRef.current.contains(event.target) && refTrigger && !refTrigger.contains(event.target)) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, refTrigger]);

    return (
        <div
        ref={modalRef}
        className="w-80 absolute top-11 right-36 bg-white rounded-lg border shadow-[0_5px_10px_rgba(0,0,0,0.25)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium text-black">Checklist</h2>
                <X
                    onClick={close}
                    className="cursor-pointer hover:bg-gray-100 rounded p-1"
                    size={20}
                />
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <label className="block">Title</label>
                    <input type="text" className="w-full rounded-md h-10" placeholder="Checklist"/>
                </div>
                <div className="w-full">
                    <label className="block">Tamplate checklist</label>
                    <InputSelect/>
                </div>

                <div>
                    <button className="p-2 bg-blue-600 rounded-md text-white">Tambah</button>
                </div>
            </div>
        </div>
    );
}