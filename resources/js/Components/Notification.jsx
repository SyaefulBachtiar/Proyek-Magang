import { useEffect } from 'react';
import { XCircle, CheckCircle, Info } from 'lucide-react';

// Komponen Notifikasi Kustom
export default function Notification({ message, type = 'info', onClose }) {
    // Tentukan ikon dan warna berdasarkan tipe notifikasi
    const notificationStyles = {
        success: {
            icon: <CheckCircle className="text-green-500" />,
            bgColor: 'bg-white',
            borderColor: 'border-green-500',
            textColor: 'text-gray-800',
        },
        error: {
            icon: <XCircle className="text-red-500" />,
            bgColor: 'bg-white',
            borderColor: 'border-red-500',
            textColor: 'text-gray-800',
        },
        info: {
            icon: <Info className="text-blue-500" />,
            bgColor: 'bg-white',
            borderColor: 'border-blue-500',
            textColor: 'text-gray-800',
        },
    };

    const styles = notificationStyles[type] || notificationStyles.info;

    // Menambahkan class untuk animasi masuk dan keluar
    return (
        <div 
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm animate-fade-in-down`}
        >
            <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${styles.bgColor} ${styles.borderColor}`}>
                <div className="flex-shrink-0">
                    {styles.icon}
                </div>
                <div className={`ms-3 text-sm font-medium ${styles.textColor}`}>
                    {message}
                </div>
                <button
                    type="button"
                    className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <span className="sr-only">Close</span>
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}