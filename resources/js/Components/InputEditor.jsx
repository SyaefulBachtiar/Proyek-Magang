import React, { useState, useMemo, useRef, useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export default function InputEditor({
    onChange,
    value,
    close,
    onSave,
    loading,
    placeholder,
    anggota_card,
    setComment,
    isCommenting
}) {
    const editorRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [mentionQuery, setMentionQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const allUsers = useMemo(() => {
        if (!anggota_card) return [];
        return anggota_card.map((angg) => ({ nama: angg.name }));
    }, [anggota_card]);

    const customToolbarOptions = useMemo(
        () => ({
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
            maxHeight: "150px",
            minHeight: "100px",
        }),
        []
    );

    const insertMention = (name) => {
        const cm = editorRef.current;
        if (!cm || !setComment) return;

        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);

        const mentionStartIndex = line.lastIndexOf("@" + mentionQuery);

        if (mentionStartIndex !== -1) {
            const from = { line: cursor.line, ch: mentionStartIndex };
            const to = cursor;
            cm.replaceRange(`@${name} `, from, to);
        } else {
            cm.replaceRange(`@${name} `, cursor, cursor);
        }

        setComment((prev) => ({
            ...prev,
            mention: `@${name}`,
        }));

        setSuggestions([]);
        setMentionQuery("");
        setHighlightedIndex(0);

        cm.focus();
    };

    const handleEditorInstance = (cm) => {
        editorRef.current = cm;
        cm.on("change", handleEditorChange);

          if (isCommenting) {
              cm.focus();
          }

        // Tambahkan event listener untuk keydown
        cm.on("keydown", (editor, event) => {
            if (suggestions.length > 0) {
                switch (event.key) {
                    case "ArrowDown":
                        event.preventDefault(); // Mencegah kursor pindah
                        setHighlightedIndex(
                            (prevIndex) => (prevIndex + 1) % suggestions.length
                        );
                        break;
                    case "ArrowUp":
                        event.preventDefault(); // Mencegah kursor pindah
                        setHighlightedIndex(
                            (prevIndex) =>
                                (prevIndex - 1 + suggestions.length) %
                                suggestions.length
                        );
                        break;
                    case "Enter":
                        event.preventDefault(); // Mencegah enter membuat baris baru
                        if (suggestions[highlightedIndex]) {
                            insertMention(suggestions[highlightedIndex].nama);
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    };

    const handleEditorChange = () => {
        const cm = editorRef.current;
        if (!cm) return;

        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);

        const atIndex = line.lastIndexOf("@", cursor.ch);

        if (atIndex !== -1) {
            const query = line.substring(atIndex + 1, cursor.ch);
            setMentionQuery(query);

            const filteredSuggestions = allUsers.filter((user) =>
                user.nama.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
            setHighlightedIndex(0); // Reset highlight saat saran berubah
        } else {
            setSuggestions([]);
            setMentionQuery("");
        }

        onChange(cm.getValue());
    };

    return (
        <div className="relative">
            <SimpleMDE
                value={value}
                onChange={(val) => {
                    onChange(val);
                }}
                options={customToolbarOptions}
                getCodemirrorInstance={handleEditorInstance}
                placeholder={placeholder}
            />

            {suggestions.length > 0 && (
                <div className="absolute bg-white border rounded shadow p-2 top-24 left-5 z-50">
                    <ul className="list-none m-0 p-0">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                className={`cursor-pointer p-1 rounded ${
                                    i === highlightedIndex
                                        ? "bg-blue-100"
                                        : "hover:bg-gray-200"
                                }`}
                                onClick={() => insertMention(s.nama)}
                            >
                                {s.nama}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex mt-4 gap-2">
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="p-2 bg-blue-600 rounded text-sm text-white"
                >
                    {loading ? "Komentar..." : "Simpan"}
                </button>

                <button
                    onClick={close}
                    className="p-2 bg-gray-300 rounded text-sm"
                >
                    Batal
                </button>
            </div>
        </div>
    );
}
