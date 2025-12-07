import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react"; 
import Dashboard, { DashboardState } from "../Dashboard"; 

export default function ContentPengaturan() {
    return (
        <Dashboard>
            <Head title="Pengaturan" />
            <Pengaturan />
        </Dashboard>
    );
}

function Pengaturan() {
    const { props, url } = usePage();
    const { perusahaanData = {}, activePage } = props;
    const { setActivePage } = DashboardState(); 

    useEffect(() => {
        if (activePage && setActivePage) {
            setActivePage(activePage);
        }
    }, [activePage, setActivePage]);

    const [formData, setFormData] = useState({
        nama: perusahaanData.nama_perusahaan || "",
        deskripsi: perusahaanData.deskripsi || "",
        logo: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nama || 'P')}&color=7F9CF5&background=EBF4FF&bold=true`;
    
    const logoToShow = previewImage || perusahaanData.logo_url || defaultImage;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
            const maxSize = 2 * 1024 * 1024; 

            if (!validTypes.includes(file.type)) {
                alert('Format file tidak didukung. Gunakan JPEG, PNG, JPG, GIF, atau SVG.');
                return;
            }

            if (file.size > maxSize) {
                alert('Ukuran file terlalu besar. Maksimal 2MB.');
                return;
            }

            setFormData((prev) => ({ ...prev, logo: file }));

            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dashboardId = url.split('/')[2];

        const dataToPost = {
            nama: formData.nama,
            deskripsi: formData.deskripsi,
        };

        if (formData.logo) {
            dataToPost.logo = formData.logo;
        }

        router.post(`/dashboard/${dashboardId}/pengaturan`, dataToPost, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: () => {
                setIsEditing(false);
                setPreviewImage(null);
                alert('Pengaturan berhasil disimpan!');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join('\n');
                alert(`Terjadi kesalahan:\n${errorMessages}`);
            },
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPreviewImage(null);
        setFormData({
            nama: perusahaanData.nama_perusahaan || "",
            deskripsi: perusahaanData.deskripsi || "",
            logo: null,
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Pengaturan Perusahaan</h1>
                    <p className="text-blue-100">Kelola informasi dan profil perusahaan Anda</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                                Logo Perusahaan
                            </label>
                            
                            <div className="text-center">
                                <div className="inline-block mb-4">
                                    <input
                                        type="file"
                                        id="logo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={!isEditing}
                                    />
                                    <label 
                                        htmlFor="logo" 
                                        className={`block ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="w-32 h-32 bg-gray-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                                            <img 
                                                src={logoToShow} 
                                                alt="Logo Perusahaan" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = defaultImage;
                                                }}
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">
                                        Klik profile untuk mengubah foto profile
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Maks foto 2 MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Perusahaan
                            </label>
                            <input
                                type="text"
                                id="nama"
                                name="nama"
                                value={formData.nama}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                                }`}
                                placeholder="Masukkan nama perusahaan"
                            />
                        </div>

                        <div className="mb-8">
                            <label htmlFor="deskripsi" className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                id="deskripsi"
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows={4}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                                }`}
                                placeholder="Deskripsi singkat tentang perusahaan"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Edit Profil</span>
                                </button>
                            ) : (
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Simpan Perubahan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}