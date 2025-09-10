/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import AdminButton from './AdminButton';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className={`
          inline-block w-full p-6 my-8 overflow-hidden text-left align-middle transition-all transform 
          bg-gray-800 border border-gray-700 shadow-xl rounded-2xl
          ${sizes[size]}
        `}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
      <div className="mb-6">
        <p className="text-gray-300">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <AdminButton
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </AdminButton>
        <AdminButton
          variant={variant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </AdminButton>
      </div>
    </AdminModal>
  );
};

export { AdminModal, AdminConfirmModal };
