import React, { useEffect } from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Fondo oscuro difuminado */}
      <div 
        className="fixed inset-0 bg-ink/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Contenedor del Modal */}
      <div 
        className="relative bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-accent/20"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-ink/20 flex justify-between items-center">
          <h2 className="text-xl font-serif text-cream">{title}</h2>
          <Button variant="outline" size="sm" onClick={onClose} className="px-2 py-1">
            ✕
          </Button>
        </div>
        
        <div className="p-6 text-cream">
          {children}
        </div>
      </div>
    </div>
  );
};