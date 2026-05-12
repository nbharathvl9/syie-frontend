"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [formData, setFormData] = useState({ rollNumber: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true);
        try {
            const res = await authApi.login(formData);
            login(res.data);
            router.push('/feed');
        } catch (err) {
            setError(err.response?.data?.msg || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 sm:px-8">
            <div className="w-full max-w-md">
                <div className="mb-10">
                    <h2 className="text-4xl font-black tracking-tighter mb-2">Welcome Back</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Sign in to continue</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                        <input
                            type="text"
                            required
                            placeholder="am.sc.u4csexxxxx"
                            className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none placeholder:text-gray-600"
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            className="w-full p-4 pr-12 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none placeholder:text-gray-600"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-black text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'SIGNING IN...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-auto pb-10 text-center text-sm">
                    <span className="text-gray-500">Don't have an account? </span>
                    <Link href="/register" className="text-black font-bold underline underline-offset-4">Create Account</Link>
                </div>
            </div>
        </div>
    );
}