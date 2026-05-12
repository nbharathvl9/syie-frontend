"use client";
import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <WifiOff size={36} className="text-gray-400" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
        You&apos;re offline
      </h1>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
        No internet connection. Previously visited pages are still available
        from cache — or try again when you&apos;re back online.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
        <Link
          href="/feed"
          className="flex items-center justify-center px-5 py-2.5 border border-gray-200 text-sm font-bold text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
        >
          Go to Feed
        </Link>
      </div>
    </div>
  );
}
