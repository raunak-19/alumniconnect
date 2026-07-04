import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-[#0d111c] border border-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4f6ef7] transition text-sm ${className}`}
      {...props}
    />
  );
}
