import { useEffect, useRef } from "react";

export default function ElipsisModal({ children, className = "", triggerRef, close }) {
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [triggerRef, close]);

    return (
        <div
            ref={modalRef}
            className={`bg-white p-2 ${className} shadow-[0_5px_10px_rgba(0,0,0,0.10)] absolute rounded z-20`}
        >
            {children}
        </div>
    );
}