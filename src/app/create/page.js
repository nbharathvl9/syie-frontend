"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { postApi, aiApi } from '@/lib/api';
import { Sparkles } from 'lucide-react';

export default function CreatePost() {
  const [formData, setFormData] = useState({ companyName: "", experience: "", postType: 'Interview', interviewDate: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rephrasing, setRephrasing] = useState(false);
  const [rephraseError, setRephraseError] = useState("");
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/login');
  }, [isLoading, isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (!user) { setError("Please login to post"); setLoading(false); return; }
      await postApi.create({ ...formData, authorRoll: user.rollNumber, authorName: user.fullName });
      router.push('/feed');
    } catch (err) {
      setError(err.response?.data?.msg || "Error creating post");
    } finally { setLoading(false); }
  };

  const handleRephrase = async () => {
    if (!formData.experience || formData.experience.trim().length < 10) {
      setRephraseError("Please write at least 10 characters before rephrasing");
      return;
    }
    setRephraseError("");
    setRephrasing(true);
    try {
      const res = await aiApi.rephrase(formData.experience);
      setFormData((prev) => ({ ...prev, experience: res.data.rephrased }));
      setRephraseError("");
    } catch (err) {
      setRephraseError(err.response?.data?.msg || "AI rephrasing failed. Please try again.");
    } finally {
      setRephrasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pt-20 sm:pt-24">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-2">Share Your Story</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Help others learn from your experience</p>
        </header>
        {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>)}
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          <div className="flex flex-col group">
            <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3 transition-colors group-focus-within:text-black">Company Name</label>
            <input type="text" required placeholder="Google, Microsoft, Amazon..."
              className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none text-sm"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
          </div>
          <div className="flex flex-col group">
            <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3">Interview Date (Optional)</label>
            <input type="date" className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none text-sm"
              value={formData.interviewDate}
              onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })} />
          </div>
          <div className="flex flex-col group">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase transition-colors group-focus-within:text-black">Your Experience</label>
              <button
                type="button"
                onClick={handleRephrase}
                disabled={rephrasing || !formData.experience?.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full text-[10px] font-bold tracking-wider uppercase hover:from-blue-700 hover:to-violet-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <Sparkles size={12} className={rephrasing ? 'animate-spin' : ''} />
                {rephrasing ? 'REPHRASING...' : 'AI REPHRASE'}
              </button>
            </div>
            <textarea required rows="10"
              value={formData.experience}
              placeholder={`Share your interview experience to help others prepare! 🎯\n\nInterview Duration: [e.g., 1.5 hours]\nRounds: [e.g., 3 - Online Test, Technical, HR]\n\nRound 1 - Online/Aptitude:\n• Questions/Topics: [List what was asked]\n• Difficulty: [Easy/Medium/Hard]\n\nRound 2 - Technical:\n• Questions asked:\n  1. [e.g., Explain your project architecture]\n  2. [e.g., Code: Implement LRU Cache]\n• Topics: [DSA, System Design, DBMS, etc.]\n\nPreparation Tips:\n- [What helped you most?]\n- [Resources/platforms used]\n\nOverall Experience:\n[Share your thoughts and advice]`}
              className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl resize-none focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none text-sm"
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
            {rephrasing && (
              <p className="mt-2 text-xs text-violet-600 font-medium animate-pulse">
                ✨ Gemini is improving your text — technical details will be preserved...
              </p>
            )}
            {rephraseError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600 font-medium">{rephraseError}</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || rephrasing}
            className="w-full py-5 bg-black text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'PUBLISHING...' : 'Publish Story'}
          </button>
        </form>
      </div>
    </div>
  );
}