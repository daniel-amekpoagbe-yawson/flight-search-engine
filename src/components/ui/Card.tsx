import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  // Padding variations - more responsive on mobile
  const paddingStyles = {
    none: '',
    sm: 'p-2 sm:p-2.5 md:p-3',
    md: 'p-3 sm:p-3.5 md:p-4',
    lg: 'p-4 sm:p-5 md:p-6',
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-lg hover:border-gray-200 transition-all duration-300' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};