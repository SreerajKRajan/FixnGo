import React from "react";

export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children }) {
  return <div className="text-2xl font-bold mb-4">{children}</div>;
}

export function ModalBody({ children }) {
  return <div className="mb-6">{children}</div>;
}

export function ModalFooter({ children }) {
  return <div className="flex justify-end space-x-3">{children}</div>;
}
