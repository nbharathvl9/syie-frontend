"use client";
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

/**
 * Custom hook encapsulating all auth state and actions.
 * Replaces scattered Cookies.get('user_data') / readCurrentUser() calls.
 *
 * Usage:
 *   const { user, isLoggedIn, login, logout } = useAuth();
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get('user_data');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const isLoggedIn = !!user;

  /**
   * Store auth data in cookies and update local state.
   * Called after a successful login or register API response.
   */
  const login = useCallback((data) => {
    Cookies.set('token', data.token, { expires: 7, sameSite: 'lax', path: '/' });
    Cookies.set('user_data', JSON.stringify(data), { expires: 7, sameSite: 'lax', path: '/' });
    setUser(data);
  }, []);

  /**
   * Clear auth cookies and redirect to login page.
   */
  const logout = useCallback(() => {
    Cookies.remove('token');
    Cookies.remove('user_data');
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, isLoggedIn, isLoading, login, logout };
}
