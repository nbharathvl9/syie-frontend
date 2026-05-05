"use client";

/**
 * Reusable confirmation modal component.
 * Extracted from the delete confirmation in student/[roll]/page.js.
 *
 * Props:
 *   show         - boolean controlling visibility
 *   title        - modal title (e.g. "Delete Post?")
 *   message      - description text
 *   confirmLabel - text for the confirm button (default: "Confirm")
 *   danger       - if true, confirm button uses red styling
 *   onConfirm    - callback when confirmed
 *   onCancel     - callback when cancelled / dismissed
 */
export default function ConfirmModal({
  show,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-black uppercase mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all uppercase tracking-wide ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
