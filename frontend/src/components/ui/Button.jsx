import React from 'react';

const variants = {
  primary: 'bg-[#4f6ef7] hover:bg-[#3b5bdb] text-white',
  outline: 'bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300',
  danger: 'bg-red-600/90 hover:bg-red-600 text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-300',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`px-4 py-2.5 rounded-md text-sm font-medium transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
