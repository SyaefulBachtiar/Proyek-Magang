import { X, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TambahAnggotaModal({ onclick }) {
    const modalOutside = useRef(null);
    const [email, setEmail] = useState("");
    const [divisi, setDivisi] = useState("");
    const [daftarDivisi, setDaftarDivisi] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        function handleClickOutside(e) {
            if (modalOutside.current && !modalOutside.current.contains(e.target)) {
                onclick();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Ambil daftar divisi dari backend
    useEffect(() => {
        fetch("/divisi")
            .then(res => res.json())
            .then(data => setDaftarDivisi(data))
            .catch(err => console.error("Gagal fetch divisi:", err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !divisi) {
            setError("Email dan divisi wajib diisi.");
            return;
        }

        console.log("Mengundang:", { email, divisi });

        setEmail("");
        setDivisi("");
        setError("");
        onclick();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
                ref={modalOutside}
                className="bg-white rounded-2xl p-8 shadow-xl w-[500px] h-auto"
            >
                <div className="flex justify-end">
                    <X onClick={onclick} className="cursor-pointer text-gray-500 hover:text-gray-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Tambah Anggota</h1>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 space-x-3">
                            <Mail className="text-gray-400" />
                            <input
                                type="email"
                                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                                placeholder="Masukkan email anggota"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <select
                                className="bg-white border border-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                                value={divisi}
                                onChange={(e) => setDivisi(e.target.value)}
                                required
                            >
                                <option value="" hidden>Pilih divisi</option>
                                {daftarDivisi.map((item) => (
                                    <option key={item.id} value={item.nama_tim}>
                                        {item.nama_tim}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            disabled={!email || !divisi}
                            className={`w-full py-3 text-white font-medium rounded-lg transition 
                                ${email && divisi ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                        >
                            Invite
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
