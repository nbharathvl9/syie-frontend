"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { userApi } from '@/lib/api';

export default function SearchPage() {
    const router = useRouter();
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError(''); setValidationError('');
        const trimmedId = searchId.trim();
        if (!trimmedId) { setValidationError('Please enter a user ID'); return; }
        const idRegex = /^am\.sc\.u4cse[a-zA-Z0-9]{5}$/i;
        if (!idRegex.test(trimmedId)) { setValidationError('Please enter a valid user ID'); return; }
        setLoading(true);
        try {
            const res = await userApi.search(trimmedId);
            if (res.data && res.data.rollNumber) {
                router.push(`/student/${res.data.rollNumber}`);
            } else { setError('No user found.'); }
        } catch (err) {
            if (err.response?.status === 404) setError('No user found.');
            else if (err.response?.status === 400) setValidationError(err.response.data.msg || 'Please enter a valid user ID');
            else setError('Something went wrong. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
            <div className="flex-1 max-w-md w-full mx-auto px-6 py-12">
                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-2xl font-black uppercase tracking-tight">Search People</h1>
                    <p className="text-sm text-gray-500 font-medium">Find student profiles by their unique ID</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="userId" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">User ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-300 group-focus-within:text-black transition-colors" />
                                </div>
                                <input type="text" id="userId" value={searchId}
                                    onChange={(e) => { setSearchId(e.target.value); if (validationError) setValidationError(''); if (error) setError(''); }}
                                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 rounded-xl text-lg font-bold placeholder-gray-300 focus:bg-white focus:outline-none transition-all ${validationError || error ? 'border-red-100 focus:border-red-500 text-red-900' : 'border-transparent focus:border-black text-black'}`}
                                    placeholder="am.sc.u4cse..." autoComplete="off" autoFocus />
                            </div>
                            {validationError && (
                                <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-fadeIn px-1">
                                    <AlertCircle size={14} /><span>{validationError}</span>
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={loading || !searchId.trim()}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl">
                            {loading ? (<><Loader2 className="animate-spin" size={20} /><span>Searching...</span></>) : (<span>Find Student</span>)}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 animate-fadeIn">
                            <div className="bg-red-100 p-2 rounded-full text-red-600"><Search size={18} /></div>
                            <span className="text-sm font-bold text-red-700">{error}</span>
                        </div>
                    )}
                </div>
                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Format example: am.sc.u4cse20001</p>
                </div>
            </div>
        </div>
    );
}
