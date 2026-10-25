import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'glass',
  size = 'md',
  pill = true,
  active = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 min-h-[28px]',
    md: 'text-xs px-3.5 py-1.5 min-h-[34px]',
    lg: 'text-sm px-5 py-2.5 min-h-[42px]',
  }[size];

  const variantClass = {
    primary: 'fg-pill-primary',
    glass: `fg-pill-glass ${active ? 'active' : ''}`,
    subtle: 'fg-pill-subtle',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20',
  }[variant];

  const rounded = pill ? 'rounded-full' : 'rounded-lg';
  const disabledStyle = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`fg-pill-button ${variantClass} ${sizeStyles} ${rounded} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0 inline-flex items-center">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
