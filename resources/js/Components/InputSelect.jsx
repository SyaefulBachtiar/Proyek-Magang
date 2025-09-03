import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function InputSelect({title_check, onSelectChange}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("(none)");
    const [searchTerm, setSearchTerm] = useState("");
    const selectRef = useRef(null);
    const inputRef = useRef(null);

    const options = [
        { id: "", title: "(none)" },
        ...(title_check || []).map((check) => ({
            id: check.id,
            title: check.title,
        })),
    ];

    // Filter options based on search term
    const filteredOptions = options.filter(
        (option) =>
            option.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option) => {
        setSelectedValue(option.title);
        if(onSelectChange){
            onSelectChange(option.id)
        }
        setSearchTerm("");
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    const handleSelectClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    return (
        <div className="w-full">
            <div className="relative" ref={selectRef}>
                {/* Select Button */}
                <button
                    onClick={handleSelectClick}
                    className="w-full px-3 py-2 text-left bg-white border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                    <span className="text-gray-600">{selectedValue}</span>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={handleInputChange}
                                placeholder="Cari opsi..."
                                className="w-full text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-48 overflow-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-gray-500 text-sm">
                                    Tidak ada opsi yang ditemukan
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() =>
                                            handleOptionClick(option)
                                        }
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="text-gray-800 font-medium">
                                            {option.title}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
