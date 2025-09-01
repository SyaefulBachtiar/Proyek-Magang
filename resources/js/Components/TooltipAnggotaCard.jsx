import { useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export default function TooltipAnggotaCard({ children, targetRef }) {
    const [position, setPosition] = useState(null);

    // useLayoutEffect lebih baik untuk pengukuran DOM agar tidak 'flicker'
    useLayoutEffect(() => {
        if (targetRef.current) {
            const targetRect = targetRef.current.getBoundingClientRect();

            // Atur posisi tooltip di atas tengah target
            setPosition({
                top: targetRect.top - 10, // Sedikit di atas target
                left: targetRect.left + targetRect.width / 2, // Tepat di tengah target
            });
        }
    }, [targetRef]);

    if (!position) return null;

    // Render tooltip menggunakan portal ke document.body
    return createPortal(
        <div
            style={{
                position: "fixed", // Gunakan fixed agar posisi relatif terhadap viewport
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: "translate(-50%, -100%)", // Geser ke tengah dan ke atas
                pointerEvents: "none", // Agar tooltip tidak mengganggu interaksi mouse
            }}
            className="bg-gray-800/40 text-white text-xs px-2 py-1 rounded z-[9999]"
        >
            {children}
        </div>,
        document.body
    );
}
