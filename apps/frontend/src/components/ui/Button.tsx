import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sso';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-55 disabled:pointer-events-none cursor-pointer';

  // Variant styles
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-sm focus:ring-blue-500 active:scale-[0.98]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-400 active:scale-[0.98]',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-slate-500 active:scale-[0.98]',
    ghost: 'hover:bg-slate-100 text-slate-600 focus:ring-slate-400 active:scale-[0.98]',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-sm focus:ring-red-500 active:scale-[0.98]',
    sso: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm focus:ring-blue-500 active:scale-[0.98] py-3 text-sm font-semibold w-full',
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
