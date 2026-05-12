"use client";

/**
 * Reusable notification modal component.
 * Replaces the ~20-line modal JSX that was copy-pasted in 4 pages.
 *
 * Props:
 *   show      - boolean controlling visibility
 *   message   - text to display
 *   type      - 'error' | 'success'
 *   onDismiss - callback to close the modal
 */
export default function NotificationModal({ show, message, type, onDismiss }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onDismiss}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className={`text-xl font-black uppercase mb-2 ${
            type === 'error' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {type === 'error' ? 'Error' : 'Success'}
        </h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <button
          onClick={onDismiss}
          className="btn-pill press-effect w-full px-4 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 uppercase tracking-wide"
        >
          OK
        </button>
      </div>
    </div>
  );
}
