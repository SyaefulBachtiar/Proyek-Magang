import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, register}) {
    return (
        <div className="flex flex-wrap sm:flex-nowrap min-h-screen">
            <div className="w-full sm:w-[90vw] h-[20vh] sm:h-screen relative">
                <div>
                    <Link
                        href="/"
                        className="absolute z-50 top-[40px] left-[30px]"
                    >
                        <div className='flex gap-4 items-center'>
                            <div className="flex items-center justify-center space-x-4 bg-white px-4 py-3 rounded-lg shadow-md w-fit mx-auto">
                            <img src="/img/kemenkes.png" alt="Logo Kemenkes" className="h-12 w-12 object-contain" />
                            <h1 className="text-2xl font-semibold text-gray-800">BBPK Ciloto</h1>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Image */}
                <div className="h-full w-full bg-gray-200">
                    <img
                        src="/img/first.png"
                        alt=""
                        className="object-cover h-full w-full"
                    />
                </div>
            </div>

            {/* Form login */}
            <div className="w-full flex flex-col gap-7 items-center px-5 sm:px-20">
                {/* Judul */}
                <div className="mt-[70px] w-full text-start space-y-3">
                    <h1 className="text-3xl sm:text-5xl">
                        {register ? "Register" : "Log in"}
                    </h1>
                    <p className="font-light text-xs sm:text-sm">
                        {register ? "Register" : "Log in"} Aplikasi kantor BBPK
                        Ciloto
                    </p>
                </div>

                {/* Form konten */}
                <div className="w-full bg-white py-4">{children}</div>
            </div>
        </div>
    );
}
