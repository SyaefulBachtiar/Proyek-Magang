import { Head, usePage, router } from "@inertiajs/react";
import Dashboard, {DashboardState} from "../Dashboard";
import { useEffect, useState, useRef } from "react";

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
    const { activePage, company: initialCompany, flash } = usePage().props;
    
    // Dashboard state
    const { setActivePage } = DashboardState();
    
    // File input ref untuk upload logo
    const fileInputRef = useRef(null);

    // State management
    const [company, setCompany] = useState({
        id: initialCompany?.id || '',
        name: initialCompany?.name || "BBPK Ciloto",
        description: initialCompany?.description || "Deskripsi singkat tentang perusahaan.",
        logo: initialCompany?.logo || "https://images.seeklogo.com/logo-png/44/1/kemenkes-logo-png_seeklogo-447836.png",
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    
    const [form, setForm] = useState({
        name: company.name,
        description: company.description,
    });

    // Update form ketika company data berubah
    useEffect(() => {
        if (initialCompany) {
            const companyData = {
                id: initialCompany.id || '',
                name: initialCompany.name || "BBPK Ciloto",
                description: initialCompany.description || "Deskripsi singkat tentang perusahaan.",
                logo: initialCompany.logo || "https://images.seeklogo.com/logo-png/44/1/kemenkes-logo-png_seeklogo-447836.png",
            };
            setCompany(companyData);
            setForm({
                name: companyData.name,
                description: companyData.description,
            });
        }
    }, [initialCompany]);

    useEffect(() => {
        if(activePage && setActivePage){
            setActivePage(activePage);
        }
    }, [activePage]);

    // Handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle save menggunakan Inertia
    const handleSave = async () => {
        setLoading(true);
        
        try {
            // Menggunakan Inertia router untuk PUT request
            router.put('/pengaturan/frontend', {
                name: form.name,
                description: form.description,
            }, {
                onSuccess: (page) => {
                    // Update state dengan data terbaru
                    setCompany({
                        ...company,
                        name: form.name,
                        description: form.description,
                    });
                    setEditing(false);
                    
                    // Show success message jika ada
                    if (page.props.flash?.success) {
                        showNotification('success', page.props.flash.success);
                    }
                },
                onError: (errors) => {
                    console.error('Error updating company:', errors);
                    showNotification('error', 'Gagal memperbarui data perusahaan');
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
            showNotification('error', 'Terjadi kesalahan saat menyimpan');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setForm({
            name: company.name,
            description: company.description,
        });
        setEditing(false);
    };

    // Handle logo upload
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi file
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showNotification('error', 'Format file harus berupa gambar (JPEG, PNG, JPG, GIF, SVG)');
            return;
        }

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            showNotification('error', 'Ukuran file maksimal 2MB');
            return;
        }

        setUploadingLogo(true);

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const response = await fetch('/pengaturan/upload-logo', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const result = await response.json();

            if (result.success) {
                setCompany({
                    ...company,
                    logo: result.logo_url
                });
                showNotification('success', 'Logo berhasil diupload');
            } else {
                showNotification('error', result.message || 'Gagal mengupload logo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('error', 'Terjadi kesalahan saat mengupload logo');
        } finally {
            setUploadingLogo(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Trigger file input
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Notification helper
    const showNotification = (type, message) => {
        // Simple notification - bisa diganti dengan toast library
        if (type === 'success') {
            console.log('✅ Success:', message);
        } else {
            console.error('❌ Error:', message);
        }
        
        // Bisa implementasikan toast notification di sini
        alert(`${type.toUpperCase()}: ${message}`);
    };

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            showNotification('success', flash.success);
        }
        if (flash?.error) {
            showNotification('error', flash.error);
        }
    }, [flash]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-5">
            <h1 className="text-3xl font-bold mb-6">Pengaturan Perusahaan</h1>

            <div className="bg-white p-6 rounded-2xl shadow space-y-6">
                {/* Logo dan Nama */}
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <img
                            src={company.logo}
                            alt={company.name}
                            className="w-20 h-20 rounded-full object-cover border"
                            onError={(e) => {
                                e.target.src = "https://images.seeklogo.com/logo-png/44/1/kemenkes-logo-png_seeklogo-447836.png";
                            }}
                        />
                        {/* Upload button overlay */}
                        <button
                            onClick={triggerFileInput}
                            disabled={uploadingLogo}
                            className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                            title="Klik untuk mengubah logo"
                        >
                            {uploadingLogo ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <span>Upload</span>
                            )}
                        </button>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                    
                    <div className="flex-1">
                        {editing ? (
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="text-xl font-semibold w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama Perusahaan"
                                required
                            />
                        ) : (
                            <h2 className="text-2xl font-semibold">
                                {company.name}
                            </h2>
                        )}
                    </div>
                </div>

                {/* Upload Logo Button (Alternative) */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Klik pada logo untuk mengubahnya (Max: 2MB, Format: JPEG, PNG, JPG, GIF, SVG)</span>
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
                            rows={4}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                            placeholder="Deskripsi perusahaan..."
                        />
                    ) : (
                        <p className="text-gray-700 leading-relaxed">
                            {company.description || "Belum ada deskripsi"}
                        </p>
                    )}
                </div>

                {/* Company ID (Hidden, for debugging) */}
                {company.id && (
                    <div className="text-xs text-gray-400">
                        ID: {company.id}
                    </div>
                )}

                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading || !form.name.trim()}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                            >
                                Batal
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit Profil</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 