"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Check, Circle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ rollNumber: "", fullName: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        // Basic Frontend Validations
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!formData.fullName.trim() || formData.fullName.length < 2 || formData.fullName.length > 100) {
            setError("Name must be between 2 and 100 characters");
            return;
        }
        if (!nameRegex.test(formData.fullName)) {
            setError("Name can only contain letters and spaces");
            return;
        }
        if (!formData.rollNumber.trim()) {
            setError("Roll number is required");
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        if (!/\d/.test(formData.password)) {
            setError("Password must contain at least one number");
            return;
        }
        if (!/[\W_]/.test(formData.password)) {
            setError("Password must contain at least one special character");
            return;
        }

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

                    <div className="space-y-1 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Choose Password"
                            className="w-full p-4 pr-12 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none placeholder:text-gray-600"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setIsPasswordFocused(true)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        
                        {/* Password Validation Animation */}
                        <div 
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                isPasswordFocused || formData.password 
                                    ? 'max-h-40 opacity-100 mt-2' 
                                    : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="flex flex-col gap-2 p-2 text-sm">
                                <div className={`flex items-center gap-2 transition-colors duration-300 ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                                    {formData.password.length >= 6 ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    <span>At least 6 characters</span>
                                </div>
                                <div className={`flex items-center gap-2 transition-colors duration-300 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                                    {/\d/.test(formData.password) ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    <span>Contains a number</span>
                                </div>
                                <div className={`flex items-center gap-2 transition-colors duration-300 ${/[\W_]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                                    {/[\W_]/.test(formData.password) ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    <span>Contains a special character</span>
                                </div>
                            </div>
                        </div>
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