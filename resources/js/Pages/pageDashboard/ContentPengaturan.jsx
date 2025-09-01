import { Head, usePage, router } from "@inertiajs/react";
import Dashboard, { DashboardState } from "../Dashboard";
import { useEffect, useState, useRef, useCallback } from "react";

export default function ContentPengaturan() {
    return (
        <Dashboard>
            <Head title="Pengaturan" />
            <Pengaturan />
        </Dashboard>
    );
}

function Pengaturan() {
    // Props dari controller
    const { props, url } = usePage();
    const { activePage, company: initialCompany, flash, errors } = props;
    
    // Dashboard state
    const { setActivePage } = DashboardState();
    
    // Refs
    const fileInputRef = useRef(null);
    const notificationTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);

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
    const [logoError, setLogoError] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    
    const [form, setForm] = useState({
        name: company.name,
        description: company.description,
    });

    const [formErrors, setFormErrors] = useState({});

    // Cleanup pada unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    // Update active page
    useEffect(() => {
        if (activePage && setActivePage) {
            setActivePage(activePage);
        }
    }, [activePage, setActivePage]);

    // Update form ketika company data berubah
    useEffect(() => {
        if (initialCompany) {
            console.log('Updating company data:', initialCompany);
            
            const companyData = {
                id: initialCompany.perusahaan_id || initialCompany.id,
                name: initialCompany.nama_perusahaan || initialCompany.name,
                description: initialCompany.deskripsi || initialCompany.description,
                logo: initialCompany.logo_url || initialCompany.logo,
            };
            
            setCompany(companyData);
            setForm({
                name: companyData.name || '',
                description: companyData.description || '',
            });
            setLogoError(false);
        }
    }, [initialCompany]);

    // Stabilized validation function
    const validateForm = useCallback(() => {
        const newErrors = {};
        
        if (!form.name.trim()) {
            newErrors.name = 'Nama perusahaan tidak boleh kosong';
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Nama perusahaan minimal 2 karakter';
        }
        
        if (form.description.trim().length > 500) {
            newErrors.description = 'Deskripsi maksimal 500 karakter';
        }
        
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form.name, form.description]);

    // Handle input change dengan validation
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        setFormErrors(prev => {
            if (prev[name]) {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            }
            return prev;
        });
    }, []);

    // Notification helper dengan auto-hide dan cleanup
    const showNotification = useCallback((type, message) => {
        if (!isMountedRef.current) return;
        
        setNotification({ show: true, type, message });
        
        // Clear existing timeout
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        
        // Set new timeout dengan cleanup
        notificationTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                setNotification(prev => ({ ...prev, show: false }));
            }
        }, 5000);
    }, []);

    // Hide notification manually
    const hideNotification = useCallback(() => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification(prev => ({ ...prev, show: false }));
    }, []);

    // Stabilized handle save dengan debouncing protection
    const handleSave = useCallback(async () => {
        if (loading || !validateForm()) {
            if (!validateForm()) {
                showNotification('error', 'Mohon perbaiki kesalahan pada form');
            }
            return;
        }

        setLoading(true);
        
        try {
            router.put('/pengaturan/frontend', {
                name: form.name.trim(),
                description: form.description.trim(),
            }, {
                preserveState: false,
                preserveScroll: true,
                onSuccess: (page) => {
                    if (!isMountedRef.current) return;
                    
                    setCompany(prev => ({
                        ...prev,
                        name: form.name.trim(),
                        description: form.description.trim(),
                    }));
                    setEditing(false);
                    setFormErrors({});
                    
                    const message = page.props.flash?.success || 'Data perusahaan berhasil diperbarui';
                    showNotification('success', message);
                },
                onError: (errors) => {
                    if (!isMountedRef.current) return;
                    
                    console.error('Validation errors:', errors);
                    setFormErrors(errors);
                    showNotification('error', 'Gagal memperbarui data perusahaan');
                },
                onFinish: () => {
                    if (isMountedRef.current) {
                        setLoading(false);
                    } 
                }
            });
        } catch (error) {
            console.error('Error:', error);
            if (isMountedRef.current) {
                setLoading(false);
                showNotification('error', 'Terjadi kesalahan saat menyimpan');
            }
        }
    }, [form.name, form.description, loading, validateForm, showNotification]);

    // Stabilized handle cancel
    const handleCancel = useCallback(() => {
        setForm({
            name: company.name,
            description: company.description,
        });
        setFormErrors({});
        setEditing(false);
    }, [company.name, company.description]);

    // Reset file input
    const resetFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Trigger file input
    const triggerFileInput = useCallback(() => {
        if (!uploadingLogo && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [uploadingLogo]);

    // Handle logo upload dengan error handling yang lebih baik
    const handleLogoUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi file
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showNotification('error', 'Format file harus berupa gambar (JPEG, PNG, JPG, GIF, SVG)');
            resetFileInput();
            return;
        }

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            showNotification('error', 'Ukuran file maksimal 2MB');
            resetFileInput();
            return;
        }

        setUploadingLogo(true);

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token tidak ditemukan');
            }

            const response = await fetch('/pengaturan/upload-logo', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                if (isMountedRef.current) {
                    setCompany(prev => ({
                        ...prev,
                        logo: result.logo_url
                    }));
                    setLogoError(false);
                    showNotification('success', 'Logo berhasil diupload');
                }
            } else {
                throw new Error(result.message || 'Gagal mengupload logo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (isMountedRef.current) {
                showNotification('error', error.message || 'Terjadi kesalahan saat mengupload logo');
            }
        } finally {
            if (isMountedRef.current) {
                setUploadingLogo(false);
            }
            resetFileInput();
        }
    }, [showNotification, resetFileInput]);

    // Handle logo error dengan prevent infinite loop
    const handleLogoError = useCallback((e) => {
        if (!logoError) {
            setLogoError(true);
            e.target.src = "https://images.seeklogo.com/logo-png/44/1/kemenkes-logo-png_seeklogo-447836.png";
        } else {
            // Jika fallback juga gagal, gunakan placeholder
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='40' y='40' text-anchor='middle' dy='.3em' font-family='Arial' font-size='12' fill='%236b7280'%3ELogo%3C/text%3E%3C/svg%3E";
        }
    }, [logoError]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            showNotification('success', flash.success);
        }
        if (flash?.error) {
            showNotification('error', flash.error);
        }
    }, [flash, showNotification]);

    // Keyboard shortcuts dengan stabilized dependencies
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (editing && !loading) {
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    handleSave();
                }
                if (e.key === 'Escape') {
                    handleCancel();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [editing, loading, handleSave, handleCancel]);

    // Reset logo error ketika logo berubah
    useEffect(() => {
        setLogoError(false);
    }, [company.logo]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Pengaturan Perusahaan</h1>
                    <p className="text-blue-100">Kelola informasi dan profil perusahaan Anda</p>
                </div>
                
                <div className="p-8">
                    {/* Notification */}
                    {notification.show && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between transition-all duration-300 ${
                            notification.type === 'success' 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                            <div className="flex items-center">
                                {notification.type === 'success' ? (
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <span>{notification.message}</span>
                            </div>
                            <button 
                                onClick={hideNotification} 
                                className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
                                aria-label="Tutup notifikasi"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Logo Section */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                            Logo Perusahaan
                        </label>
                        
                        <div className="text-center">
                            <div className="inline-block mb-4 relative">
                                <img
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200 shadow-lg"
                                    onError={handleLogoError}
                                    onLoad={() => setLogoError(false)}
                                />
                                
                                {/* Upload button overlay */}
                                <button
                                    onClick={triggerFileInput}
                                    disabled={uploadingLogo}
                                    className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Klik untuk mengubah logo"
                                    aria-label="Upload logo perusahaan"
                                >
                                    {uploadingLogo ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span className="text-xs">Upload</span>
                                        </div>
                                    )}
                                </button>
                                
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    disabled={uploadingLogo}
                                />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                    Klik logo untuk mengubah foto profil
                                </p>
                                <p className="text-xs text-gray-500">
                                    Maksimal 2MB (JPEG, PNG, JPG, GIF, SVG)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                        {/* Nama Perusahaan */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Perusahaan
                            </label>
                            {editing ? (
                                <div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                            formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Nama Perusahaan"
                                        required
                                        maxLength={100}
                                        disabled={loading}
                                    />
                                    {formErrors.name && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.name}
                                        </p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-1">
                                        {form.name.length}/100 karakter
                                    </p>
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {company.name}
                                    </h2>
                                </div>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi Perusahaan
                            </label>
                            {editing ? (
                                <div>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        maxLength={500}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical transition-colors ${
                                            formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="Deskripsi perusahaan..."
                                    />
                                    {formErrors.description && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.description}
                                        </p>
                                    )}
                                    <p className={`text-xs mt-1 ${
                                        form.description.length > 450 ? 'text-orange-500' : 'text-gray-500'
                                    }`}>
                                        {form.description.length}/500 karakter
                                    </p>
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 leading-relaxed">
                                        {company.description || "Belum ada deskripsi"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company ID (Hidden, for debugging) */}
                    {company.id && process.env.NODE_ENV === 'development' && (
                        <div className="mt-6 text-xs text-gray-400 font-mono bg-gray-100 p-2 rounded">
                            ID: {company.id}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t mt-8">
                        {editing && (
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                                <span className="flex items-center">
                                    <kbd className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">Ctrl+S</kbd>
                                    <span className="ml-1">simpan</span>
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center">
                                    <kbd className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">Esc</kbd>
                                    <span className="ml-1">batal</span>
                                </span>
                            </div>
                        )}
                        
                        <div className="flex space-x-3 ml-auto">
                            {editing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading || uploadingLogo}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading || !form.name.trim() || uploadingLogo}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                                    >
                                        {loading && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        )}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    disabled={uploadingLogo}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Edit Profil</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}