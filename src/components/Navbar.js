"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, X, BadgeCheck, Loader2 } from 'lucide-react';
import { userApi } from '@/lib/api';

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/* ── Skeleton row shown while fetching ── */
function SkeletonRow() {
    return (
        <li className="flex items-center gap-3 px-4 py-3">
            <div className="skeleton w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-2 w-20 rounded" />
            </div>
        </li>
    );
}

export default function Navbar() {
    const router   = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    /* ── Search state ── */
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [query,        setQuery]        = useState('');
    const [suggestions,  setSuggestions]  = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [focused,      setFocused]      = useState(false);
    const [activeIdx,    setActiveIdx]    = useState(-1);
    const [clickedRoll,  setClickedRoll]  = useState(null); // tracks which row was pressed

    const inputRef     = useRef(null);
    const containerRef = useRef(null);
    const debouncedQ   = useDebounce(query, 280);

    useEffect(() => {
        const c = Cookies.get('user_data');
        if (c) setUser(JSON.parse(c));
    }, []);

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setFocused(false);
                setSearchOpen(false);
                setQuery('');
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Fetch suggestions with loading state ── */
    useEffect(() => {
        if (debouncedQ.length < 2) { setSuggestions([]); setLoading(false); return; }
        setLoading(true);
        userApi.suggest(debouncedQ)
            .then(res => { setSuggestions(res.data || []); setActiveIdx(-1); })
            .catch(() => setSuggestions([]))
            .finally(() => setLoading(false));
    }, [debouncedQ]);

    /* Show loading skeleton while typing (before debounce fires) */
    const isFetching = loading || (query.length >= 2 && query !== debouncedQ);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user_data');
        router.push('/login');
    };

    const openSearch = () => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 60);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setQuery('');
        setSuggestions([]);
        setFocused(false);
        setClickedRoll(null);
    };

    const navigateToUser = useCallback((roll) => {
        setClickedRoll(roll);
        /* small delay so user sees the pressed state before navigation */
        setTimeout(() => {
            closeSearch();
            router.push(`/student/${roll}`);
        }, 120);
    }, [router]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIdx >= 0) navigateToUser(suggestions[activeIdx].rollNumber);
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    };

    const navLinks = [
        { name: 'Experiences', href: '/feed'    },
        { name: 'Discussion',  href: '/discuss'  },
        { name: 'Share Story', href: '/create'   },
    ];

    const showDropdown = focused && query.length >= 2;

    /* ── Suggestion list content ── */
    const renderSuggestions = (mobile = false) => {
        if (isFetching) {
            return [1, 2, 3].map(n => <SkeletonRow key={n} />);
        }
        if (suggestions.length === 0) {
            return (
                <li className="px-4 py-6 text-center text-sm text-gray-400 font-medium animate-fadeIn">
                    No users found for &ldquo;{query}&rdquo;
                </li>
            );
        }
        return suggestions.map((s, i) => {
            const isActive   = i === activeIdx;
            const isClicked  = clickedRoll === s.rollNumber;
            return (
                <li key={s.rollNumber} className="animate-fadeIn" style={{ animationDelay: `${i * 30}ms` }}>
                    <button
                        onMouseDown={() => navigateToUser(s.rollNumber)}
                        className={`suggestion-row w-full flex items-center gap-3 px-4 py-3 text-left
                            ${isActive  ? 'bg-gray-100' : ''}
                            ${isClicked ? 'bg-gray-200 scale-[0.985]' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`${mobile ? 'w-8 h-8' : 'w-9 h-9'} rounded-full bg-gray-900 text-white 
                            flex items-center justify-center text-sm font-black shrink-0
                            transition-transform duration-150 ${isClicked ? 'scale-90' : ''}`}>
                            {isClicked
                                ? <Loader2 size={14} className="animate-spin" />
                                : s.fullName?.[0]?.toUpperCase() || '?'
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-gray-900 truncate">{s.fullName}</span>
                                {s.isPlaced && <BadgeCheck size={13} className="text-green-500 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{s.rollNumber}</span>
                        </div>
                        {s.isPlaced && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full shrink-0 animate-scaleIn">
                                Placed
                            </span>
                        )}
                    </button>
                </li>
            );
        });
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link href="/" className="font-bold tracking-tight text-lg flex items-center gap-2 shrink-0 press-effect">
                    <span className="text-black">Placement</span>
                    <span className="text-gray-400">Flow</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`nav-link text-xs font-bold uppercase tracking-widest
                                ${pathname === link.href ? 'text-black active' : 'text-gray-400 hover:text-black'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Right: Search + User Actions */}
                <div className="hidden md:flex items-center gap-3">

                    {/* Inline Search */}
                    <div ref={containerRef} className="relative">
                        {/* Collapsed search button */}
                        {!searchOpen ? (
                            <button
                                onClick={openSearch}
                                className="press-effect flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black px-2 py-1 rounded-lg transition-colors duration-150"
                            >
                                <Search size={15} />
                                <span>Search</span>
                            </button>
                        ) : (
                            /* Expanded search bar */
                            <div className="flex items-center gap-2 w-72 search-bar-enter">
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onFocus={() => setFocused(true)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Search by name or roll no..."
                                        className="w-full pl-8 pr-4 py-2 text-sm bg-gray-100 rounded-full 
                                            border-2 border-transparent focus:border-black focus:bg-white 
                                            outline-none transition-all duration-200"
                                    />
                                    {/* Loading spinner inside input */}
                                    {isFetching && (
                                        <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                    )}
                                </div>
                                <button
                                    onClick={closeSearch}
                                    className="press-effect text-gray-400 hover:text-black rounded-full p-1 transition-colors duration-150"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Suggestions Dropdown */}
                        {searchOpen && showDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                                <ul className="max-h-72 overflow-y-auto dropdown-scroll py-1">
                                    {renderSuggestions()}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* User / Login */}
                    {user ? (
                        <>
                            <Link
                                href={`/student/${user.rollNumber}`}
                                className="press-effect text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors duration-150"
                            >
                                {user.fullName}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn-pill bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest hover:bg-gray-800"
                            >
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="btn-pill bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest hover:bg-gray-800"
                        >
                            LOGIN
                        </Link>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden p-2 press-effect rounded-lg"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className="space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ease-in-out ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu — slides down */}
            {menuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3 animate-slideDown">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`press-effect block text-sm font-bold py-2.5 px-3 rounded-xl transition-colors duration-150
                                ${pathname === link.href
                                    ? 'text-black bg-gray-50'
                                    : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Mobile Search */}
                    <div ref={containerRef} className="relative">
                        <div className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2.5 transition-all duration-200
                            ${focused ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'}`}>
                            <Search size={15} className={`shrink-0 transition-colors duration-200 ${focused ? 'text-black' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search people..."
                                className="flex-1 text-sm outline-none bg-transparent"
                            />
                            {isFetching && <Loader2 size={13} className="text-gray-400 animate-spin shrink-0" />}
                            {query && !isFetching && (
                                <button
                                    onClick={() => { setQuery(''); setSuggestions([]); }}
                                    className="press-effect text-gray-400 hover:text-black"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                                <ul className="max-h-60 overflow-y-auto dropdown-scroll py-1">
                                    {renderSuggestions(true)}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="pt-1 flex justify-between items-center">
                        {user ? (
                            <>
                                <Link
                                    href={`/student/${user?.rollNumber}`}
                                    className="press-effect text-sm font-bold text-black hover:text-gray-600 transition-colors"
                                >
                                    {user?.fullName}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="press-effect text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                >
                                    LOGOUT
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="btn-pill block w-full text-center py-2.5 bg-black text-white text-sm font-bold rounded-xl"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}