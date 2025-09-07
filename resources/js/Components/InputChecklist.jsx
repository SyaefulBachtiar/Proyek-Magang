import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

export default function InputChecklist({ close, value, id_check }) {
    const {auth} = usePage().props;
    const [editValue, setEditValue] = useState(value || "");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
        if(inputRef.current) {
            inputRef.current.focus();
        }
        function handleClickOutside(e) {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [inputRef]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.put(
            route("update.title.checklist", {
                id: auth.user.id,
                id_check: id_check,
            }),
            {
                id_checklist_card: id_check,
                title_checklist: editValue,
            },{
                preserveState: true,
                onSuccess: () => {
                    close()
                },
                onFinish: () => {
                    setLoading(false);
                }
            }
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {loading ? (
                <span className="text-gray-400">
                    Loading...
                </span>
            ) : (
                <input
                ref={inputRef}
                value={editValue}
                type="text"
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-10 rounded"
            />
            )}
        </form>
    );
}