import { Link } from "@inertiajs/react";

export default function GuestLayout({ children, register }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-300 via-teal-200 to-green-300">
            <div className="absolute top-10 left-10 z-10 hidden sm:block">
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/img/kemenkes.png"
                        alt="Logo Kemenkes"
                        className="object-contain h-10 w-10"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-teal-700 leading-tight">
                            Kemenkes
                        </h1>
                        <p className="text-sm font-semibold text-teal-600">
                            BBPK Ciloto
                        </p>
                    </div>
                </Link>
            </div>

            <div className="hidden sm:block sm:w-1/2">
                <img
                    src="/img/login.png"
                    alt="Ilustrasi Login"
                    className="object-contain w-full h-auto max-w-lg mx-auto"
                />
            </div>

            <div className="flex flex-col items-center justify-center w-full max-w-xl px-10 py-20 sm:w-2/3 sm:px-0">

                <div className="w-full rounded-3xl bg-gradient-to-br from-teal-400/80 to-green-400/80 p-10 backdrop-blur-sm shadow-2xl">
                    <div className="mb-8 flex justify-center sm:hidden">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/img/kemenkes.png"
                                alt="Logo Kemenkes"
                                className="object-contain h-10 w-10"
                            />
                            <h1 className="text-xl font-bold text-white">
                                BBPK Ciloto
                            </h1>
                        </Link>
                    </div>

                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold text-white tracking-wide">
                            SIKEL
                        </h1>
                        <p className="mt-1 text-xl font-bold text-white">
                            Sistem Informasi Kegiatan Laporan
                        </p>
                    </div>

                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}