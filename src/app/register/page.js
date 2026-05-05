"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ rollNumber: "", fullName: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true);
        try {
            const res = await authApi.register(formData);
            // Auto-login: Store auth cookies same as login flow
            login(res.data);
            router.push('/feed');
        } catch (err) {
            setError(err.response?.data?.msg || "Error creating account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 sm:px-8">
            <div className="w-full max-w-md">
                <div className="mb-10">
                    <h2 className="text-4xl font-black tracking-tighter mb-2">Create Account</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Join the community</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-1">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none placeholder:text-gray-600"
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <input
                            type="text"
                            required
                            placeholder="am.sc.u4csexxxxx"
                            className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none placeholder:text-gray-600"
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <input
                            type="password"
                            placeholder="Choose Password"
                            className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none placeholder:text-gray-600"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "CREATING ACCOUNT..." : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-black font-bold hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}