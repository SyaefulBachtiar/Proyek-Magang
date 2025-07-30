import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Dashboard from '../Dashboard';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import { Pencil } from 'lucide-react';

export default function Edit({ auth }) {
  return (
    <Dashboard>
      <Head title={auth.user.name} />
      <ProfileContent user={auth.user} />
    </Dashboard>
  );
}

function ProfileContent({ user }) {
  const { data, setData, post, processing } = useForm({
    name: user.name,
  });

  const [editMode, setEditMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('profile.update'), {
      preserveScroll: true,
      onSuccess: () => setEditMode(false),
    });
  };

  return (
    <div className="py-12 space-y-8">
      <div className="bg-white max-w-3xl mx-auto rounded-3xl shadow-md p-8 text-center space-y-6">

        {/* Foto Profil */}
        <div className="relative inline-block">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpQlcvIG6zkq4HlnHP0bX00SYzGexaxgUeSg&s"
            alt="Foto Profil"
            className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 mx-auto"
          />
          <button
            className="absolute bottom-1 right-1 bg-yellow-400 text-white p-1 rounded-full shadow hover:scale-105 transition"
            title="Ubah Foto"
          >
            <Pencil size={16} />
          </button>
        </div>

        {/* Nama dan Email */}
        <div>
          {editMode ? (
            <input
              type="text"
              className="text-2xl font-semibold text-gray-800 text-center w-full border-b focus:outline-none"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          )}
          <p className="text-gray-500 text-sm">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">HRD</p>
        </div>

        {/* Tombol */}
        <div className="flex justify-center gap-4 mt-4">
          {editMode ? (
            <>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={processing}
                className="px-6 py-2 rounded-full bg-yellow-400 text-white hover:bg-yellow-500"
              >
                Simpan
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 rounded-full bg-yellow-400 text-white hover:bg-yellow-500"
            >
              Ubah Nama
            </button>
          )}
        </div>
      </div>

      {/* Update Password */}
      <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ganti Password</h3>
        <UpdatePasswordForm className="max-w-xl mx-auto" />
      </div>

      {/* Delete Account */}
      <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Hapus Akun</h3>
        <DeleteUserForm className="max-w-xl mx-auto" />
      </div>
    </div>
  );
}
