import React, { useState, useMemo } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export default function InputEditor({onChange, value, close, onSave, loading}) {

    const customToolbarOptions = useMemo(() => {
        return {
            toolbar: [
                "bold",
                "italic",
                "heading",
                "|",
                "quote",
                "unordered-list",
                "ordered-list",
            ],
            status: false,
            spellChecker: false,
            // --- TAMBAHKAN INI UNTUK MENGATUR TINGGI ---
            maxHeight: "150px", // Atur tinggi maksimal editor
            minHeight: "100px", // Atur tinggi minimal editor (opsional)
        };
    }, []);

    return (
        <div>
        <SimpleMDE
            value={value}
            onChange={onChange}
            options={customToolbarOptions}
        />
        <div className="flex mt-4 gap-2">
            <button 
            onClick={onSave}
            className={`p-2 bg-blue-600 rounded text-sm ${loading ? 'text-gray-400' : 'text-white'}`}>{loading ? "Menyimpan..." : "Simpan"}</button>
            <button 
            onClick={close}
            className="p-2 bg-gray-300 rounded text-sm">Batal</button>
        </div>
        </div>
    );
}
