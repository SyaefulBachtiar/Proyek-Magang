import { Head, usePage } from "@inertiajs/react";
import Dashboard, {DashboardState} from "../Dashboard";
import { useEffect, useState } from "react";

export default function ContentPengaturan () {
    return (
        <Dashboard>
            <Head title="Pengaturan" />
            <Pengaturan />
        </Dashboard>
    );
}

function Pengaturan () {

    // Props dari controller
    const { activePage } = usePage().props;

    // Dashboard state
    const { setActivePage } = DashboardState();

    useEffect(() => {
        if(activePage && setActivePage){
            setActivePage(activePage);
        }
    }, [activePage]);

    const [company, setCompany] = useState({
        name: "Kemenkes Ciloto",
        description: "Deskripsi singkat tentang perusahaan.",
        logo: "https://via.placeholder.com/150",
    });

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: company.name,
        description: company.description,
        logo: company.logo,
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setCompany({ ...company, ...form });
        setEditing(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-5">
            <h1 className="text-3xl font-bold mb-6">Pengaturan Perusahaan</h1>

            <div className="bg-white p-6 rounded-2xl shadow space-y-6">
                {/* Logo dan Nama */}
                <div className="flex items-center space-x-4">
                    <img
                        src="https://images.seeklogo.com/logo-png/44/1/kemenkes-logo-png_seeklogo-447836.png"
                        alt="BBPK Ciloto"
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                    {editing ? (
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="text-xl font-semibold w-full border rounded px-3 py-1"
                            placeholder="Nama Perusahaan"
                        />
                    ) : (
                        <h2 className="text-2xl font-semibold">
                            {company.name}
                        </h2>
                    )}
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                    </label>
                    {editing ? (
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Deskripsi perusahaan"
                        />
                    ) : (
                        <p className="text-gray-700">{company.description}</p>
                    )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Simpan
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Batal
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                            Edit Profil
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


