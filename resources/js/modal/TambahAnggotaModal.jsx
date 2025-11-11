import { router } from "@inertiajs/react";
import { X, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TambahAnggotaModal({ onclick }) {
    const modalOutside = useRef(null);
    const [email, setEmail] = useState("");
    const [role, setrole] = useState("");
    const [daftarrole, setDaftarrole] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                modalOutside.current &&
                !modalOutside.current.contains(e.target)
            ) {
                onclick();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !role) {
            setError("Email dan role wajib diisi.");
            return;
        }

        router.post(
            "/undangan",
            { email, role },
            {
                onSuccess: () => {
                    setEmail("");
                    setrole("");
                    setError("");
                    onclick();
                },
                onError: (errors) => {
                    setError(
                        errors.email || errors.role || "Terjadi kesalahan."
                    );
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div
                ref={modalOutside}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-[500px] h-auto"
            >
                <div className="flex justify-end">
                    <X
                        onClick={onclick}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                    />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
                        Tambah Anggota
                    </h1>
                    <form
                        className="space-y-4 sm:space-y-6"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex flex-wrap sm:flex-nowrap items-center bg-gray-100 rounded-xl px-4 py-3 gap-3">
                            <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
                                <Mail className="text-gray-400 flex-shrink-0" />
                                <input
                                    type="email"
                                    className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 border-none focus:outline-none focus:ring-0 min-w-0"
                                    placeholder="Masukkan email anggota"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <select
                                className="w-full sm:w-auto bg-white border border-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-0 pr-7"
                                value={role}
                                onChange={(e) => setrole(e.target.value)}
                                required
                            >
                                <option value="" hidden>
                                    Pilih Role
                                </option>

                                <option value="Member">Member</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={!email || !role}
                            className={`w-full py-3 text-white font-medium rounded-lg transition 
                                ${
                                    email && role
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Invite
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}