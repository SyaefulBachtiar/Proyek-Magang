// resources/js/Pages/Auth/Login.jsx

import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const customInputStyle =
  "mt-1 block w-full border-0 border-b-2 border-white/70 bg-transparent pl-3 pb-2 text-white transition duration-200 ease-in-out focus:border-green-300 focus:ring-0 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:transition-[background-color_9999s_ease-in-out]";

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="block space-y-8">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="text-1xl font-bold text-white"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={customInputStyle} 
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className="text-sm font-medium text-white"
                    />

                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}

                            className={`${customInputStyle} pr-10`}
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-0 text-white/70 transition hover:text-white focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* (Perbaikan) 'mt-6' dihapus */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className="rounded border-white/100 bg-transparent text-green-500 shadow-sm transition focus:ring-green-400"
                        />
                        <span className="ms-2 text-sm text-white/90">
                            Ingat Saya
                        </span>
                    </label>

                    <Link
                        href={route("password.request")}
                        className="text-sm font-medium text-white underline transition hover:text-green-200"
                    >
                        Lupa Password?
                    </Link>
                </div>

                <div>
                    <PrimaryButton
                        className="w-full justify-center rounded-lg bg-green-500 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-green-600 hover:shadow-lg active:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                        disabled={processing}
                    >
                        Login
                    </PrimaryButton>
                </div>

                <div className="text-center">
                    <p className="text-sm text-white/90">
                        Belum Punya Akun?{" "}
                        <Link
                            href={route("register")}
                            className="font-bold text-white underline transition hover:text-green-200"
                        >
                            Daftar
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}