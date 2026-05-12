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
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-black text-white uppercase mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-400 mb-6">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="press-effect flex-1 px-4 py-3 bg-gray-900 text-gray-300 border border-gray-800 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`btn-pill press-effect flex-1 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
