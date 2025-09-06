import InputSelect from "@/Components/InputSelect";
import { router, usePage } from "@inertiajs/react";
import { X } from "lucide-react";
import { useRef, useState } from "react";

export default function Checklist ({ close, card_id, id_tim, refTrigger, title_check }) {
    const {auth, errors} = usePage().props;
    const modalRef = useRef(null);


    const [data, setData] = useState({
        'title': "",
        'template_id': "",
        'foto': ""
    })

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

    const handleSelectChange = (selectId) => {
        setData((prevData) => ({
            ...prevData,
            template_id: selectId,
        }));
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(
            route("store.title.checklist", {
                id: auth.user.id,
                id_tim: id_tim,
                id_card: card_id
            }),
            data,
            {
                preserveState: true,
                onSuccess: () => {
                    close();
                },
            }
        );
    }

    return (
        <div
            ref={modalRef}
            className="w-80 absolute top-11 right-36 bg-white rounded-lg border shadow-[0_5px_10px_rgba(0,0,0,0.25)]"
        >
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
                    <input
                        type="text"
                        name="title"
                        disabled={!!data.template_id}
                        className={`w-full rounded h-10 ${
                            errors.title ? "border-red-500" : ""
                        }`}
                        placeholder="Checklist"
                        value={data.title}
                        onChange={handleChange}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.title}
                        </p>
                    )}
                </div>
                <div className="w-full">
                    <label className="block">Tamplate checklist</label>
                    <InputSelect
                        title_check={title_check}
                        onSelectChange={handleSelectChange}
                    />
                </div>

                <div>
                    <button
                        onClick={handleSubmit}
                        className="p-2 bg-blue-600 rounded-md text-white"
                    >
                        Tambah
                    </button>
                </div>
            </div>
        </div>
    );
}