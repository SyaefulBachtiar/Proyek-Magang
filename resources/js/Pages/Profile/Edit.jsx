import { useState, useEffect, useMemo } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import Dashboard from "../Dashboard";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import { Pencil, Camera, User, Mail, FileText } from "lucide-react";

export default function Edit({ auth, user }) {
    return (
        <Dashboard>
            <Head title={auth.user.name} />
            <ProfileContent user={auth.user} userProfile={user} />
        </Dashboard>
    );
}

function ProfileContent({ user, userProfile }) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || "",
        email: user.email || "",
        jabatan: userProfile.perusahaan?.jabatan || "",
        bio_profile: userProfile.bio_profile || "",
        poto_profile_user: null,
    });

    const [editMode, setEditMode] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    const initialData = useMemo(
        () => ({
            name: user.name || "",
            email: user.email || "",
            jabatan: userProfile.perusahaan?.jabatan || "",
            bio_profile: userProfile.bio_profile || "",
            poto_profile_user: null,
        }),
        [user, userProfile]
    );

    useEffect(() => {
        const dataToCompare = { ...data, poto_profile_user: null };
        setIsDirty(
            JSON.stringify(dataToCompare) !== JSON.stringify(initialData)
        );
    }, [data, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("jabatan", data.jabatan || "");
        formData.append("bio_profile", data.bio_profile || "");
        if (data.poto_profile_user) {
            formData.append("poto_profile_user", data.poto_profile_user);
        }

        router.post(route("profile.update", { id: user.id }), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditMode(false);
                setPreviewImage(null);
            },
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("poto_profile_user", file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getProfileImageSrc = () => {
        if (previewImage) return previewImage;
        if (userProfile.poto_profile_user)
            return `/storage/${userProfile.poto_profile_user}`;
        return (
            "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(user.name) +
            "&size=128&background=e5e7eb&color=6b7280"
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Profil Pengguna
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Kelola informasi profil dan pengaturan akun Anda
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-slate-100 to-gray-100"></div>

                    <div className="relative px-6 pb-6">
                        <div className="relative -mt-12 mb-6 flex justify-center">
                            <div className="relative">
                                <img
                                    src={getProfileImageSrc()}
                                    alt="Foto Profil"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                                />
                                {editMode && (
                                    <label
                                        htmlFor="profile-image"
                                        className="absolute bottom-0 right-0 bg-gray-600 text-white p-1.5 rounded-full shadow-sm hover:bg-gray-700 cursor-pointer"
                                        title="Ubah Foto Profil"
                                    >
                                        <Camera size={14} />
                                        <input
                                            id="profile-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {editMode ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Input Fields */}
                                <InputField
                                    label="Nama Lengkap"
                                    icon={
                                        <User
                                            size={16}
                                            className="mr-2 text-gray-500"
                                        />
                                    }
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    error={errors.name}
                                />
                                <InputField
                                    label="Jabatan"
                                    icon={
                                        <FileText
                                            size={16}
                                            className="mr-2 text-gray-500"
                                        />
                                    }
                                    type="text"
                                    value={data.jabatan}
                                    onChange={(e) =>
                                        setData("jabatan", e.target.value)
                                    }
                                    placeholder="Jabatan di perusahaan"
                                    error={errors.jabatan}
                                />
                                <InputField
                                    label="Email"
                                    icon={
                                        <Mail
                                            size={16}
                                            className="mr-2 text-gray-500"
                                        />
                                    }
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    error={errors.email}
                                />
                                <InputTextArea
                                    label="Bio Profil"
                                    icon={
                                        <FileText
                                            size={16}
                                            className="mr-2 text-gray-500"
                                        />
                                    }
                                    value={data.bio_profile}
                                    onChange={(e) =>
                                        setData("bio_profile", e.target.value)
                                    }
                                    placeholder="Ceritakan tentang diri Anda"
                                    error={errors.bio_profile}
                                />

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setPreviewImage(null);
                                            setData(initialData);
                                        }}
                                        className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !isDirty}
                                        className="px-6 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center flex flex-col items-center">
                                <div className="my-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {user.name}
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {user.email}
                                    </p>
                                </div>
                                <p className="text-black text-sm bg-green-400 p-2 rounded-md">
                                    {userProfile.perusahaan?.jabatan || "Tidak ada jabatan"}
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 my-4 rounded-lg p-4">
                                    {userProfile.bio_profile ||
                                        "Belum ada bio."}
                                </p>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900 font-medium"
                                >
                                    <Pencil size={14} className="mr-2" />
                                    Edit Profil
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password & Delete Section */}
                <UpdatePasswordForm className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" />
                <DeleteUserForm className="bg-white rounded-2xl shadow-sm border border-red-100 p-6" />
            </div>
        </div>
    );
}

function InputField({ label, icon, type, value, onChange, error, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                {icon}
                {label}
            </label>
            <input
            placeholder={placeholder}
                type={type}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function InputTextArea({ label, icon, value, onChange, error, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                {icon}
                {label}
            </label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 resize-none text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
