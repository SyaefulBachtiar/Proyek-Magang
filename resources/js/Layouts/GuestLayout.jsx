import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex flex-wrap sm:flex-nowrap min-h-screen">
            <div className="w-full sm:w-[90vw] min-h-[10vh] sm:min-h-screen">
                <div>
                    <Link href="/">
                        {/* <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" /> */}
                    </Link>
                </div>

                {/* Image */}
                <div className="h-full w-full bg-gray-200"></div>
            </div>

            {/* Form login */}
            <div className="w-full flex flex-col gap-7 items-center px-20">
                {/* Judul */}
                <div className='mt-[100px] w-full text-start space-y-3'>
                    <h1 className='text-3xl sm:text-5xl'>Log in</h1>
                    <p className='font-light text-xs sm:text-sm'>Login Aplikasi kantor BBPK Ciloto</p>
                </div>

                {/* Form konten */}
                <div className="w-full bg-white py-4">{children}</div>
            </div>
        </div>
    );
}
