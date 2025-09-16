import { useState, forwardRef } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import Dashboard from "../Dashboard";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import { Pencil, Camera, User, Mail, FileText, Briefcase } from "lucide-react";

// Komponen Utama Halaman Edit Profil
export default function Edit({ auth, user }) {
    return (
        <Dashboard>
            <Head title={`Pengaturan Profil - ${auth.user.name}`} />
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                    {/* Komponen utama untuk informasi profil */}
                    <ProfileContent user={auth.user} userProfile={user} />

                    {/* Komponen untuk pengaturan kata sandi */}
                    <ProfileSection
                        title="Ubah Kata Sandi"
                        description="Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman."
                    >
                        <UpdatePasswordForm className="p-6" />
                    </ProfileSection>

                    {/* Komponen untuk hapus akun */}
                    <ProfileSection
                        title="Hapus Akun"
                        description="Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen."
                        variant="danger"
                    >
                        <DeleteUserForm className="p-6" />
                    </ProfileSection>
                </div>
            </div>
        </Dashboard>
    );
}

// -- Komponen Inti: Konten Profil --
function ProfileContent({ user, userProfile }) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        name: user.name || "",
        email: user.email || "",
        jabatan: userProfile.perusahaan?.jabatan || "",
        bio_profile: userProfile.bio_profile || "",
        poto_profile_user: null,
    });

    const [editMode, setEditMode] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route("profile.update", { id: user.id }), {
            _method: 'put',
            ...data,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditMode(false);
                setPreviewImage(null);
                reset('poto_profile_user');
            },
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("poto_profile_user", file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setPreviewImage(null);
        reset(); // Reset form ke kondisi awal
    }

    const getProfileImageSrc = () => {
        if (previewImage) return previewImage;
        if (userProfile.poto_profile_user)
            return `/storage/${userProfile.poto_profile_user}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=256&background=f1f5f9&color=1e293b&bold=true`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Banner Section */}
            <div className="h-32 bg-slate-100">
                {/* Anda bisa menaruh gambar banner di sini jika mau */}
            </div>

            {/* Content Section */}
            <div className="px-6 pb-8">
                {/* Avatar and Edit Button Container */}
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16">
                    <div className="relative flex-shrink-0">
                        <img
                            src={getProfileImageSrc()}
                            alt="Foto Profil"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        {editMode && (
                            <label
                                htmlFor="profile-image-upload"
                                className="absolute bottom-1 right-1 grid place-items-center w-9 h-9 bg-black/60 text-white rounded-full backdrop-blur-sm hover:bg-slate-800 cursor-pointer transition-all duration-300"
                                title="Ubah Foto Profil"
                            >
                                <Camera size={18} />
                                <input
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    <div className="w-full sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-grow">
                        {/* Conditional rendering for Name and Edit button */}
                        {!editMode && (
                             <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                                <button onClick={() => setEditMode(true)} className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 transition-colors duration-300">
                                    <Pencil size={14} /> Edit Profil
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Details (View or Edit) */}
                <div className="mt-8">
                    {editMode ? (
                        // -- FORM EDIT --
                        <form onSubmit={handleSubmit} className="space-y-6">
                             {errors.poto_profile_user && <p className="text-red-500 text-xs text-center -mt-2 mb-4">{errors.poto_profile_user}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nama Lengkap" id="name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} icon={<User />} />
                                <InputField label="Email" id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} icon={<Mail />} />
                            </div>
                             <InputField label="Jabatan" id="jabatan" value={data.jabatan} onChange={e => setData('jabatan', e.target.value)} error={errors.jabatan} icon={<Briefcase />} placeholder="Contoh: Frontend Developer" />
                             <InputTextArea label="Bio Profil" id="bio" value={data.bio_profile} onChange={e => setData('bio_profile', e.target.value)} error={errors.bio_profile} placeholder="Ceritakan sedikit tentang diri Anda..." icon={<FileText />} />
                            
                            <div className="flex justify-end items-center gap-4 pt-5 border-t border-slate-200">
                                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing || !isDirty} className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300">
                                    {processing ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // -- TAMPILAN VIEW --
                        <div className="space-y-4">
                            <div>
    {/* Label "Jabatan" sebagai judul */}
    <span className="text-sm font-semibold text-slate-500">
        Jabatan
    </span>
    
    {/* Nilai/Jawaban di bawahnya, diberi jarak margin-top (mt-2) */}
    <div className="mt-2">
        <span className="text-sm font-semibold bg-sky-100 text-sky-800 px-3 py-1 rounded-md">
            {userProfile.perusahaan?.jabatan || "Belum diatur"}
        </span>
    </div>
</div>
                            <div>
                                <span className="text-sm font-semibold text-slate-500">Bio</span>
                                <p className="mt-1 text-base text-slate-700 max-w-2xl leading-relaxed">
                                    {userProfile.bio_profile || "Pengguna ini belum menulis bio."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// -- Komponen Pembantu (UI Components) --

const ProfileSection = ({ title, description, children, variant = "default" }) => {
    const borderClass = variant === "danger" ? "border-red-300/70" : "border-slate-200/80";
    const titleClass = variant === "danger" ? "text-red-900" : "text-slate-900";

    return (
        <div className={`bg-white rounded-2xl shadow-sm border ${borderClass}`}>
            <div className="p-6 border-b ${borderClass}">
                <h3 className={`text-lg font-bold ${titleClass}`}>{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
            {children}
        </div>
    );
};

const InputField = forwardRef(({ id, label, icon, type = "text", error, ...props }, ref) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            {icon && <span className="text-slate-400">{icon}</span>}
            {label}
        </label>
        <input
            id={id}
            type={type}
            ref={ref}
            className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg border text-sm text-slate-800 placeholder:text-slate-400 ${error ? 'border-red-400 focus:ring-red-500/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/50'} focus:ring-2 focus:ring-offset-2 transition-all duration-300`}
            {...props}
        />
        {error && <p className="text-red-600 text-xs mt-1.5">{error}</p>}
    </div>
));

const InputTextArea = ({ id, label, icon, error, ...props }) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
             {icon && <span className="text-slate-400">{icon}</span>}
             {label}
        </label>
        <textarea
            id={id}
            rows={4}
            className={`w-full px-4 py-2.5 bg-slate-50 rounded-lg border text-sm text-slate-800 placeholder:text-slate-400 resize-none ${error ? 'border-red-400 focus:ring-red-500/50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/50'} focus:ring-2 focus:ring-offset-2 transition-all duration-300`}
            {...props}
        />
        {error && <p className="text-red-600 text-xs mt-1.5">{error}</p>}
    </div>
);