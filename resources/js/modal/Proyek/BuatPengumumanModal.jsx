// resources/js/modal/Proyek/BuatPengumumanModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

export default function BuatPengumumanModal({ close, timId, dashboardId }) {
    // Gunakan useForm dari Inertia untuk handling form yang mudah
    const { data, setData, post, processing, errors, reset } = useForm({
        pesan: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke route 'proyek.pengumuman.store'
        post(route('proyek.pengumuman.store', { id: dashboardId, id_tim: timId }), {
            onSuccess: () => {
                reset(); // Kosongkan form setelah berhasil
                close(); // Tutup modal
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Buat Pengumuman Baru</h2>
                    <button onClick={close} className="p-1 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <textarea
                            name="pesan"
                            value={data.pesan}
                            onChange={(e) => setData('pesan', e.target.value)}
                            className="w-full h-40 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Tulis pengumuman Anda di sini..."
                        ></textarea>
                        {/* Tampilkan pesan error jika ada */}
                        {errors.pesan && <p className="text-red-500 text-sm mt-1">{errors.pesan}</p>}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={processing} // Tombol dinonaktifkan saat proses pengiriman
                            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Pengumuman'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}