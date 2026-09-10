import React from 'react';
import { AlertCircle, X, Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-navy/60 backdrop-blur-sm animate-fadeIn p-4">
      <div 
        className="bg-white rounded-2xl shadow-elevated w-full max-w-md overflow-hidden transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-primaryBlue/10 text-primaryBlue'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-navy tracking-tight">{title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-borderLine">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-muted hover:text-navy hover:bg-gray-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-2 ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-primaryBlue hover:bg-[#0D55C2] shadow-primaryBlue/20'
            }`}
          >
            {isDestructive && <Trash2 className="w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
