import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    // Generamos un ID único si no nos pasan uno, para enlazar el label
    const inputId = id || Math.random().toString(36).substr(2, 9);

    return (
      <div className="flex flex-col w-full font-sans">
        {label && (
          <label htmlFor={inputId} className="mb-2 text-sm font-medium text-cream">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 bg-surface text-cream rounded-md border 
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent 
            placeholder:text-cream/50 disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-danger' : 'border-surface/50'} 
            ${className}
          `}
          {...props}
        />
        
        {error && <span className="mt-1 text-sm text-danger">{error}</span>}
        {helperText && !error && <span className="mt-1 text-sm text-cream/70">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';