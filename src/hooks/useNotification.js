"use client";
import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notification modal state.
 * Replaces the duplicated { show, message, type } state + modal JSX in 4+ pages.
 *
 * Usage:
 *   const { notification, showError, showSuccess, dismiss } = useNotification();
 *   ...
 *   <NotificationModal {...notification} onDismiss={dismiss} />
 */
export function useNotification() {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const showError = useCallback((message) => {
    setNotification({ show: true, message, type: 'error' });
  }, []);

  const showSuccess = useCallback((message) => {
    setNotification({ show: true, message, type: 'success' });
  }, []);

  const dismiss = useCallback(() => {
    setNotification({ show: false, message: '', type: '' });
  }, []);

  return { notification, showError, showSuccess, dismiss };
}
