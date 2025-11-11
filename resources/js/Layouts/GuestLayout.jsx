import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children, register }) {
    return (
        <div className="flex min-h-screen bg-white">
            <div className="relative hidden sm:block sm:w-1/2">
                <Link
                    href="/"
                    className="absolute z-10 top-10 left-10"
                >
                    <div className="flex items-center justify-center gap-4 px-4 py-3 bg-white rounded-lg shadow-md w-fit">
                        <img
                            src="/img/kemenkes.png"
                            alt="Logo Kemenkes"
                            className="object-contain h-10 w-10"
                        />
                        <h1 className="text-xl font-semibold text-gray-800">
                            BBPK Ciloto
                        </h1>
                    </div>
                </Link>

                {/* Gambar */}
                <img
                    src="/img/first.png"
                    alt="BBPK Ciloto"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="flex flex-col w-full px-6 py-40 sm:w-1/2 sm:px-12 lg:px-20">
                
                {/* Logo untuk Mobile (Muncul di atas form) */}
                <div className="mb-10 sm:hidden">
                    <Link href="/" className="flex items-center gap-3 w-fit">
                        <img
                            src="/img/kemenkes.png"
                            alt="Logo Kemenkes"
                            className="object-contain h-10 w-10"
                        />
                        <h1 className="text-xl font-semibold text-gray-800">
                            BBPK Ciloto
                        </h1>
                    </Link>
                </div>

                <div className="w-full mb-8 text-start">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        {register ? "Register" : "Log in"}
                    </h1>
                    <p className="mt-2 text-sm font-light text-gray-600">
                        {register
                            ? "Buat akun baru"
                            : "Login ke Aplikasi kantor BBPK Ciloto"}
                    </p>
                </div>

                <div className="w-full">{children}</div>
            </div>

        </div>
    );
}